
const express = require("express");
const mongoose = require("mongoose");
const Api = require("../models/api");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// All routes in this file require admin access.
router.use(authMiddleware, adminMiddleware);

// GET: Dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const [
      totalApis,
      pendingApis,
      approvedApis,
      rejectedApis,
      totalUsers,
      categories,
      recentApis,
    ] = await Promise.all([
      Api.countDocuments(),
      Api.countDocuments({ status: "pending" }),
      Api.countDocuments({ status: "approved" }),
      Api.countDocuments({ status: "rejected" }),
      User.countDocuments(),
      Api.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Api.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("submittedBy", "name email"),
    ]);

    res.json({
      success: true,
      data: {
        totalApis,
        pendingApis,
        approvedApis,
        rejectedApis,
        totalUsers,
        categories,
        recentApis,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics.",
    });
  }
});

// GET: All APIs, optionally filtered by status
router.get("/apis", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid API status.",
        });
      }
      filter.status = status;
    }

    const apis = await Api.find(filter)
      .sort({ createdAt: -1 })
      .populate("submittedBy", "name email");

    res.json({
      success: true,
      count: apis.length,
      data: apis,
    });
  } catch (error) {
    console.error("Admin API list error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch APIs.",
    });
  }
});

// PATCH: Approve or reject an API
router.patch("/apis/:id/status", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid API ID.",
      });
    }

    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const api = await Api.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).populate("submittedBy", "name email");

    if (!api) {
      return res.status(404).json({
        success: false,
        message: "API not found.",
      });
    }

    res.json({
      success: true,
      message: `API ${status} successfully.`,
      data: api,
    });
  } catch (error) {
    console.error("Admin API status error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update API status.",
    });
  }
});

// DELETE: Remove an API as admin
router.delete("/apis/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid API ID.",
      });
    }

    const api = await Api.findByIdAndDelete(req.params.id);

    if (!api) {
      return res.status(404).json({
        success: false,
        message: "API not found.",
      });
    }

    res.json({
      success: true,
      message: "API deleted successfully.",
    });
  } catch (error) {
    console.error("Admin API delete error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete API.",
    });
  }
});

// GET: Registered users (never return passwords)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map((user) => user._id);

    const submissionCounts = await Api.aggregate([
      { $match: { submittedBy: { $in: userIds } } },
      { $group: { _id: "$submittedBy", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      submissionCounts.map((item) => [
        item._id.toString(),
        item.count,
      ])
    );

    res.json({
      success: true,
      count: users.length,
      data: users.map((user) => ({
        ...user,
        submissions: countMap.get(user._id.toString()) || 0,
      })),
    });
  } catch (error) {
    console.error("Admin users error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
});

module.exports = router;
