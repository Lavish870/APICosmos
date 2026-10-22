require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./connection");
const Api = require("./models/api");

const sampleApis = [
  {
    name: "OpenAI API",
    description:
      "Build AI-powered applications using language models and intelligent tools.",
    category: "AI & Machine Learning",
    auth: "API Key",
    pricing: "Freemium",
    url: "https://platform.openai.com/docs",
    website: "https://openai.com/",
    color: "AI",
  },
  {
    name: "Open-Meteo",
    description:
      "Get weather forecasts and historical weather data for locations worldwide.",
    category: "Weather",
    auth: "No Auth",
    pricing: "Free",
    url: "https://open-meteo.com/en/docs",
    website: "https://open-meteo.com/",
    color: "WE",
  },
  {
    name: "ExchangeRate API",
    description:
      "Retrieve currency exchange rates for financial applications.",
    category: "Finance",
    auth: "API Key",
    pricing: "Freemium",
    url: "https://www.exchangerate-api.com/",
    website: "https://www.exchangerate-api.com/",
    color: "FX",
  },
  {
    name: "REST Countries",
    description:
      "Access country information including population, region, and currencies.",
    category: "Other",
    auth: "No Auth",
    pricing: "Free",
    url: "https://restcountries.com/",
    website: "https://restcountries.com/",
    color: "RC",
  },
  {
    name: "OpenStreetMap",
    description:
      "Explore geographic data for mapping and location-based projects.",
    category: "Maps & Location",
    auth: "Varies",
    pricing: "Free",
    url: "https://www.openstreetmap.org/",
    website: "https://www.openstreetmap.org/",
    color: "OS",
  },
  {
    name: "JSONPlaceholder",
    description:
      "Use a fake REST API to practise and test frontend applications.",
    category: "Development Tools",
    auth: "No Auth",
    pricing: "Free",
    url: "https://jsonplaceholder.typicode.com/",
    website: "https://jsonplaceholder.typicode.com/",
    color: "JS",
  },
  {
    name: "TMDB API",
    description:
      "Discover movie, television, and entertainment information.",
    category: "Entertainment",
    auth: "API Key",
    pricing: "Free tier",
    url: "https://developer.themoviedb.org/docs",
    website: "https://www.themoviedb.org/",
    color: "TM",
  },
  {
    name: "Discord API",
    description:
      "Integrate applications and bots with Discord services.",
    category: "Communication",
    auth: "OAuth / Token",
    pricing: "Free",
    url: "https://discord.com/developers/docs/intro",
    website: "https://discord.com/",
    color: "DC",
  },
  {
    name: "GitHub REST API",
    description:
      "Access repositories, users, issues, and developer activity.",
    category: "Development Tools",
    auth: "Token",
    pricing: "Free tier",
    url: "https://docs.github.com/en/rest",
    website: "https://github.com/",
    color: "GH",
  },
];

async function seedDatabase() {
  try {
    await connectDB();

    // Prevent duplicate entries when the seed script runs again.
    await Api.deleteMany({});

    const insertedApis = await Api.insertMany(sampleApis);

    console.log(`${insertedApis.length} APIs inserted successfully.`);
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
