require("dotenv").config();
console.log("🔥 MY SERVER.JS IS RUNNING 🔥");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();

app.get("/test", (req, res) => {
  res.send("SERVER IS WORKING");
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* =========================
   DATABASE CONNECTION
========================= */
mongoose
  .connect(
    "mongodb+srv://matrimonyUser:Matrimony123@cluster0.qmqpriq.mongodb.net/matrimonyDB?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("DB ERROR:", err));

/* =========================
   IMAGE UPLOAD SETUP
========================= */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "matrimony",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });
const otpStore = new Map();

/* =========================
   AUTH ROUTES
========================= */

// SECRET KEY
const JWT_SECRET = "digighatak_secret_key";

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // CHECK EXISTING USER
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
    const user = new User({
      ...req.body,
      password: hashedPassword,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await user.save();

    // CREATE TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user,
    });
  } catch (err) {
    console.log("SERVER ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // FIND USER
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid password",
      });
    }

    // GENERATE TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user,
    });
  } catch (err) {
    console.log("SERVER ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* =========================
   OTP ROUTES
========================= */
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { type, value } = req.body;

    if (!type || !value) {
      return res.status(400).json({
        error: "Type and value are required",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(`${type}:${value}`, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.log(`OTP for ${type} (${value}): ${otp}`);

    res.json({
      message: `OTP sent to ${type}.`,
      otp, // remove this later if you don't want to show OTP in response
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { type, value, otp } = req.body;

    if (!type || !value || !otp) {
      return res.status(400).json({
        error: "Type, value, and otp are required",
      });
    }

    const key = `${type}:${value}`;
    const record = otpStore.get(key);

    if (!record) {
      return res.status(400).json({
        error: "OTP not found or expired",
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({
        error: "OTP expired",
      });
    }

    if (record.otp !== otp) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    otpStore.delete(key);

    res.json({
      message: `${type} verified successfully`,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* =========================
   GET USERS + FILTER API
========================= */
app.get("/api/users", async (req, res) => {
  console.log("✅ GET /api/users HIT");

  try {
    const { name, minAge, maxAge, location, religion } = req.query;

    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (location) {
      filter.location = location;
    }

    if (religion) {
      filter.religion = religion;
    }

    if (minAge && maxAge) {
      filter.age = {
        $gte: Number(minAge),
        $lte: Number(maxAge),
      };
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET SINGLE USER
========================= */
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    console.log("========== USER FROM DB ==========");
    console.dir(user.toObject(), { depth: null });
    console.log("==================================");

    res.json(user);
  } catch (err) {
    console.log("SERVER ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* =========================
   CREATE USER (WITH IMAGE)
========================= */
app.post(
  "/api/users",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "profilePhotos", maxCount: 10 },
    { name: "familyPhotos", maxCount: 10 },
    { name: "officePhotos", maxCount: 10 },
    { name: "horoscopeFile", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = new User({
        ...req.body,
        password: hashedPassword,

        image: req.files?.image?.[0] ? req.files.image[0].path : "",

        profilePhotos:
          req.files?.profilePhotos?.map((file) => file.path) || [],

        familyPhotos: req.files?.familyPhotos?.map((file) => file.path) || [],

        officePhotos: req.files?.officePhotos?.map((file) => file.path) || [],

        horoscopeFile: req.files?.horoscopeFile?.[0]?.path || "",
      });

      await user.save();

      res.json(user);
    } catch (err) {
      console.log("SERVER ERROR:", err);

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

/* =========================
   UPDATE USER
========================= */
console.log("✅ UPDATE ROUTE REGISTERED");

app.put(
  "/api/users/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "profilePhotos", maxCount: 10 },
    { name: "familyPhotos", maxCount: 10 },
    { name: "officePhotos", maxCount: 10 },
    { name: "horoscopeFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("BODY:");
      console.dir(req.body, { depth: null });

      const updateData = { ...req.body };

      console.log("========== UPDATE DATA ==========");
      Object.keys(updateData).forEach((key) => {
        console.log(key, "=>", updateData[key]);
      });
      console.log("=================================");

      // Remove fields that should NEVER come from frontend
      delete updateData.interestRequests;
      delete updateData.acceptedRequests;
      delete updateData.blockedUsers;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.__v;
      delete updateData.password;

      // Main image
      if (req.files?.image?.[0]) {
        updateData.image = req.files.image[0].path;
      }

      // Profile photos
      if (req.files?.profilePhotos) {
        updateData.profilePhotos = req.files.profilePhotos.map(
          (file) => file.path
        );
      }

      // Family photos
      if (req.files?.familyPhotos) {
        updateData.familyPhotos = req.files.familyPhotos.map(
          (file) => file.path
        );
      }

      // Office photos
      if (req.files?.officePhotos) {
        updateData.officePhotos = req.files.officePhotos.map(
          (file) => file.path
        );
      }
      if (req.files?.horoscopeFile?.[0]) {
  updateData.horoscopeFile = req.files.horoscopeFile[0].path;
}

      console.log("UPDATE DATA:");
      console.dir(updateData, { depth: null });

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      res.json(updatedUser);
    } catch (err) {
      console.log("========== UPDATE ERROR ==========");
      console.log(err);
      console.log("==================================");

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

/* =========================
   CHANGE PASSWORD
========================= */
app.put("/api/users/:id/password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: "Old password and new password are required",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* =========================
   SEND INTEREST REQUEST
========================= */
app.put("/api/users/:receiverId/interest/:senderId", async (req, res) => {
  try {
    const { receiverId, senderId } = req.params;

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        error: "Receiver not found",
      });
    }

    const alreadyInterested = receiver.interestRequests.some(
      (id) => id.toString() === senderId
    );

    if (alreadyInterested) {
      receiver.interestRequests = receiver.interestRequests.filter(
        (id) => id.toString() !== senderId
      );
      await receiver.save();

      return res.json({
        message: "Interest removed successfully.",
      });
    }

    receiver.interestRequests.push(senderId);
    await receiver.save();

    res.json({
      message: "Interest request sent successfully.",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* =========================
   BLOCK USER
========================= */
app.put("/api/users/:id/block/:blockId", async (req, res) => {
  try {
    const { id, blockId } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (!user.blockedUsers.includes(blockId)) {
      user.blockedUsers.push(blockId);
      await user.save();
    }

    res.json({
      message: "User blocked successfully",
      blockedUsers: user.blockedUsers,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* =========================
   REPORT USER
========================= */
app.put("/api/users/:id/report", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    user.reportedCount += 1;
    await user.save();

    res.json({
      message: "Profile reported successfully",
      reportedCount: user.reportedCount,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* =========================
   DELETE USER
========================= */
app.delete("/api/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* =========================
   START SERVER
========================= */
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});