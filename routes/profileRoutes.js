const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// GET all profiles
router.get("/", async (req, res) => {
  const profiles = await Profile.find();
  res.json(profiles);
});

// POST new profile
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Data:");
    console.log(req.body);

    const newProfile = new Profile(req.body);

    await newProfile.save();

    res.json(newProfile);
  } catch (err) {
    console.error("SAVE ERROR:");
    console.error(err);

    res.status(500).json({
      message: err.message,
      error: err,
    });
  }
});