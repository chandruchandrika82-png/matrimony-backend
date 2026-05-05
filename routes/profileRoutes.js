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
  const newProfile = new Profile(req.body);
  await newProfile.save();
  res.json(newProfile);
});

module.exports = router;