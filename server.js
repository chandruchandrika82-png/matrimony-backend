const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* =========================
   DATABASE CONNECTION
========================= */
mongoose.connect(
  "mongodb+srv://matrimonyUser:Matrimony123@cluster0.qmqpriq.mongodb.net/matrimonyDB?retryWrites=true&w=majority"
)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("DB ERROR:", err));

/* =========================
   IMAGE UPLOAD SETUP
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

/* =========================
   AUTH ROUTES
========================= */

/* =========================
   AUTH ROUTES (JWT)
========================= */

// SECRET KEY
const JWT_SECRET = "digighatak_secret_key";

// REGISTER
app.post("/api/register", async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body;

    // CHECK EXISTING USER
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
   

   const user = new User({
     ...req.body,
     password: hashedPassword,
    image: req.file ? `/uploads/${req.file.filename}` : ""
   });

    await user.save();

    // CREATE TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      user
    });

  } 
  catch (err) {
  console.log("SERVER ERROR:", err);

  res.status(500).json({
    error: err.message
  });
}
});

// LOGIN
app.post("/api/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    // FIND USER
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "User not found"
      });
    }

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid password"
      });
    }

    // GENERATE TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      user
    });

  } 
  catch (err) {
  console.log("SERVER ERROR:", err);

  res.status(500).json({
    error: err.message
  });
}

});

/* =========================
   GET USERS + FILTER API
========================= */
app.get("/api/users", async (req, res) => {
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
        $lte: Number(maxAge)
      };
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json(users);
  } 
  catch (err) {
  console.log("SERVER ERROR:", err);

  res.status(500).json({
    error: err.message
  });
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
        error: "User not found"
      });
    }

    res.json(user);

  } 
  catch (err) {
  console.log("SERVER ERROR:", err);

  res.status(500).json({
    error: err.message
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
    { name: "officePhotos", maxCount: 10 }
  ]),
  async (req, res) => {
      try {

    const hashedPassword = await bcrypt.hash(
      req.body.password,
      10
    );

    const user = new User({
  ...req.body,
  password: hashedPassword,

  image: req.files?.image?.[0]
    ? `/uploads/${req.files.image[0].filename}`
    : "",

  profilePhotos:
    req.files?.profilePhotos?.map(
      file => `/uploads/${file.filename}`
    ) || [],

  familyPhotos:
    req.files?.familyPhotos?.map(
      file => `/uploads/${file.filename}`
    ) || [],

  officePhotos:
    req.files?.officePhotos?.map(
      file => `/uploads/${file.filename}`
    ) || []
});

    await user.save();

    res.json(user);

  } 
  catch (err) {
  console.log("SERVER ERROR:", err);

  res.status(500).json({
    error: err.message
  });
}
});

/* =========================
   UPDATE USER
========================= */
app.put(
  "/api/users/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "profilePhotos", maxCount: 10 },
    { name: "familyPhotos", maxCount: 10 },
    { name: "officePhotos", maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);

      const updateData = {
        ...req.body
      };

      // Main Profile Image
      if (req.files?.image?.[0]) {
        updateData.image = `/uploads/${req.files.image[0].filename}`;
      }

      // Profile Photos
      if (req.files?.profilePhotos) {
        updateData.profilePhotos = req.files.profilePhotos.map(
          (file) => `/uploads/${file.filename}`
        );
      }

      // Family Photos
      if (req.files?.familyPhotos) {
        updateData.familyPhotos = req.files.familyPhotos.map(
          (file) => `/uploads/${file.filename}`
        );
      }

      // Office Photos
      if (req.files?.officePhotos) {
        updateData.officePhotos = req.files.officePhotos.map(
          (file) => `/uploads/${file.filename}`
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          error: "User not found"
        });
      }

      res.json(updatedUser);

    } catch (err) {

  console.log("========== ERROR ==========");
  console.log(err);
  console.log("MESSAGE:", err.message);
  console.log("FIELD:", err.field);
  console.log("FILES:", req.files);
  console.log("===========================");

  res.status(500).json({
    error: err.message,
    field: err.field
  });

}
  }
);
/* =========================
   TOGGLE INTEREST
========================= */
app.put("/api/users/:id/toggle", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    user.interested = !user.interested;
    await user.save();

    res.json(user);
  } 
  catch (err) {
  console.log("SERVER ERROR:", err);

  res.status(500).json({
    error: err.message
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