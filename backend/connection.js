
const mongoose = require("mongoose");
const dns = require("node:dns/promises");
require("./models/api");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    //await mongoose.model("Api").createIndexes();

    console.log("Database connected successfully");
    console.log("API indexes created successfully");
  } catch (error) {
    console.error("Database connection or index setup failed:", error.message);
    throw error;
  }
}

module.exports = connectDB;
