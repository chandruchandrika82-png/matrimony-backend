const mongoose = require("mongoose");
module.exports = mongoose.model("SiteSettings", new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  name: String, address: String, phone: String, website: String, logo: String,
}, { timestamps: true }));
