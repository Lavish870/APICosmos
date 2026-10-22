
const express = require("express");
const mongoose = require("mongoose");
const Api = require("../models/api");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET: Fetch all APIs (public)
router.get("/", async (req, res) => {
    try {
        const apis = await Api.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: apis.length,
            data: apis,
        });
    } catch (error) {
        console.error("Error fetching APIs:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch APIs",
        });
    }
});

// GET: Fetch one API by name (public)
router.get("/name/:name", async (req, res) => {
    try {
        const api = await Api.findOne({
            name: {
                $regex: `^${req.params.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i",
            },
        });

        if (!api) {
            return res.status(404).json({
                success: false,
                message: "API not found",
            });
        }

        res.status(200).json({
            success: true,
            data: api,
        });
    } catch (error) {
        console.error("Error fetching API:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch API",
        });
    }
});

// GET: Fetch APIs submitted by the logged-in user
router.get("/mine", authMiddleware, async (req, res) => {
    try {
        const apis = await Api.find({
            submittedBy: req.user.id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: apis.length,
            data: apis,
        });
    } catch (error) {
        console.error("Error fetching user's APIs:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch your APIs",
        });
    }
});

// POST: Create a new API (login required)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            auth,
            pricing,
            url,
            website,
            color,
        } = req.body;

        if (
            !name?.trim() ||
            !description?.trim() ||
            !category?.trim() ||
            !auth?.trim() ||
            !pricing?.trim() ||
            !url?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required API details.",
            });
        }

        const existingApi = await Api.findOne({
            name: name.trim(),
        }).collation({ locale: "en", strength: 2 });

        if (existingApi) {
            return res.status(409).json({
                success: false,
                message: "An API with this name already exists.",
            });
        }

        const newApi = await Api.create({
            name: name.trim(),
            description: description.trim(),
            category: category.trim(),
            auth: auth.trim(),
            pricing: pricing.trim(),
            url: url.trim(),
            website: website?.trim() || "",
            color: color?.trim() || "API",
            submittedBy: req.user.id,
            status: "pending",
        });

        res.status(201).json({
            success: true,
            message: "API submitted successfully and is pending review.",
            data: newApi,
        });
    } catch (error) {
        console.error("Error creating API:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An API with this name already exists.",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create API",
        });
    }
});

// PUT: Update an API (owner only)
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid API ID",
            });
        }

        const api = await Api.findById(req.params.id);

        if (!api) {
            return res.status(404).json({
                success: false,
                message: "API not found",
            });
        }

        if (!api.submittedBy || api.submittedBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only update APIs you submitted.",
            });
        }

        // Do not allow clients to change ownership or approval status.
        const allowedFields = [
            "name",
            "description",
            "category",
            "auth",
            "pricing",
            "url",
            "website",
            "color",
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                api[field] = req.body[field];
            }
        }

        await api.save();

        res.status(200).json({
            success: true,
            message: "API updated successfully",
            data: api,
        });
    } catch (error) {
        console.error("Error updating API:", error.message);

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An API with this name already exists.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update API",
        });
    }
});

// DELETE: Delete an API (owner only)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid API ID",
            });
        }

        const api = await Api.findById(req.params.id);

        if (!api) {
            return res.status(404).json({
                success: false,
                message: "API not found",
            });
        }

        if (!api.submittedBy || api.submittedBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only delete APIs you submitted.",
            });
        }

        await api.deleteOne();

        res.status(200).json({
            success: true,
            message: "API deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting API:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to delete API",
        });
    }
});

module.exports = router;
