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
    state: String,
    country: String,
    maritalStatus: String,

    // Career
    education: String,
    occupation: String,
    occupationType: String,

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

    nri: String,

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
    birthTime: String,
    birthPlace: String,
    horoscopeFile: String,

    // Family
    fatherName: String,
    fatherOccupation: String,

    motherName: String,
    motherOccupation: String,

    brothersCount: Number,
    brothersMarried: Number,

    sistersCount: Number,
    sistersMarried: Number,

    familyType: String,
    familyStatus: String,

    // Partner Preference
    preferredAgeFrom: Number,
    preferredAgeTo: Number,
    preferredHeight: String,
    preferredEducation: String,
    preferredOccupation: String,
    preferredReligion: String,
    preferredCaste: String,
    preferredLocation: String,

    // Assets
    landAcres: String,
    landValue: String,
    house: String,
    vehicle: String,
    otherAssets: String,

    // Others
    languages: String,
    hobbies: String,
    expectations: String,
    lands: String,
    address: String,
    registerAs: String,

    // Photos
    image: String,
    profilePhotos: [String],
    familyPhotos: [String],
    officePhotos: [String],

    // Verification
    gstVerified: {
      type: Boolean,
      default: false,
    },

    businessVerified: {
      type: Boolean,
      default: false,
    },

    // Privacy
    hideMobile: {
      type: Boolean,
      default: false,
    },

    hideIncome: {
      type: Boolean,
      default: false,
    },

    hideCompany: {
      type: Boolean,
      default: false,
    },

    hidePhotos: {
      type: Boolean,
      default: false,
    },

    profileVisibility: {
      type: String,
      default: "Public",
    },

    // Premium
    isPremium: {
      type: Boolean,
      default: false,
    },

    // Interest System
    interestRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    acceptedRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Block & Report
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reportedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);