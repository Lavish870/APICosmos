
const User = require("../models/User");

async function adminMiddleware(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to verify admin access.",
    });
  }
}

module.exports = adminMiddleware;
