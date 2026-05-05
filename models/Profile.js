const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  name: String,
  age: Number,
  religion: String,
  caste: String,
  location: String,
  image: String
});

module.exports = mongoose.model("Profile", profileSchema);