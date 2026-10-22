
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./connection");
const apiRouter = require("./routers/ApiRouter");
const authRouter = require("./routers/AuthRouter");
const adminRouter = require("./routers/AdminRouter");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);


// Home route: check whether the backend is running
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "APICosmos backend is running!",
  });
});

// API routes
app.use("/api/apis", apiRouter);

// Start server after connecting to MongoDB
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`APICosmos backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
}

startServer();
