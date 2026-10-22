
const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

function sendAuthResponse(res, user, message, status = 200) {
    const token = generateToken(user);

    return res.status(status).json({
        success: true,
        message,
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "user",
        },
    });
}

// Signup route
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
        });

        return sendAuthResponse(
            res,
            newUser,
            "Signup successful",
            201
        );
    } catch (error) {
        console.error("Signup error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Signup failed",
        });
    }
});

// Email-password login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter email and password",
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        return sendAuthResponse(res, user, "Login successful");
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
});

// Google login
router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required",
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.sub || !payload.email) {
            return res.status(401).json({
                success: false,
                message: "Invalid Google account",
            });
        }

        if (payload.email_verified !== true) {
            return res.status(401).json({
                success: false,
                message: "Google email is not verified",
            });
        }

        const email = payload.email.trim().toLowerCase();

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: payload.name || email.split("@")[0],
                email,
                // Google-only account: no local password is used.
                password: `google:${payload.sub}`,
            });
        }

        return sendAuthResponse(res, user, "Google login successful");
    } catch (error) {
        console.error("Google login error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Google login failed. Please try again.",
        });
    }
});
// Get currently logged-in user's details
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "name email createdAt"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
});



module.exports = router;
