
require("dotenv").config();

const mongoose = require("mongoose");
const readline = require("readline/promises");
const connectDB = require("../connection");
const User = require("../models/User");

async function createAdmin() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const name = (await rl.question("Admin name: ")).trim();
    const email = (
      await rl.question("Admin email: ")
    ).trim().toLowerCase();
    const password = await rl.question("Admin password: ");

    if (!name || !email || !password) {
      throw new Error("All fields are required.");
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already exists. Choose a new email."
      );
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    console.log("\nAdmin account created successfully!");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
  } catch (error) {
    console.error("\nError:", error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

createAdmin();
