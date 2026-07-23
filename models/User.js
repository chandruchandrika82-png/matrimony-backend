const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Authentication
    name: String,
    email: String,
    password: String,

    // Basic Details
    mobile: String,
    age: Number,
    gender: String,
    dob: String,

    // Personal
    nativePlace: String,
    currentCity: String,
    height: String,
    weight: String,
    district: String,
    maritalStatus: String,


    // Career
    education: String,
    occupation: String,
    nri: String,

    companyName: String,
    businessType: String,
    annualIncome: String,
    businessLocation: String,
    businessWebsite: String,
    socialMedia: String,
    businessCategory: String,
    yearsInBusiness: String,
    numberOfEmployees: String,
    branchLocations: String,
    occupationType: String,

    // Religion
    religion: String,
    caste: String,
    subCaste: String,

    // Horoscope
    star: String,
    zodiac: String,
    rashi: String,
    gothram: String,
    dosha: String,

    // Family
    fatherName: String,
    motherName: String,
    siblings: String,
    siblingsStatus: String,
    siblingAge: String,

    // Others
    languages: String,
    hobbies: String,
    expectations: String,
    lands: String,

    phone: String,
    address: String,

    registerAs: String,

    // Photos
    profilePhotos: [String],
    familyPhotos: [String],
    officePhotos: [String],

    image: String,

    // Verification
    gstVerified: {
      type: Boolean,
      default: false
    },

    businessVerified: {
      type: Boolean,
      default: false
    },

    interested: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);