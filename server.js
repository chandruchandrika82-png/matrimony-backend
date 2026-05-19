const multer = require("multer");
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ======================
// ✅ MongoDB
// ======================
mongoose.connect("mongodb+srv://matrimonyUser:Matrimony123@cluster0.qmqpriq.mongodb.net/matrimonyDB?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB ERROR:", err));

// ======================
// ✅ MULTER (IMAGE UPLOAD)
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ======================
// ✅ USER SCHEMA (UPDATED)
// ======================
const userSchema = new mongoose.Schema({
  name: String,
  email: String,       // ✅ NEW
  password: String,    // ✅ NEW

  age: Number,
  location: String,
  image: String,
  interested: { type: Boolean, default: false },

  gender: String,
  dob: String,
  timeOfBirth: String,
  placeOfBirth: String,

  fatherName: String,
  motherName: String,

  education: String,
  job: String,
  income: String,

  caste: String,
  religion: String,
  star: String,
  zodiac: String,
  dosha: String,

  address: String,
  phone: String,

  zodiacImage: String,
  navamsaImage: String
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// ======================
// 💬 MESSAGE SCHEMA
// ======================
const messageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

// ======================
// 👤 AUTH ROUTES
// ======================

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { email } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = new User(req.body);
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// 👤 USER ROUTES
// ======================

// GET ALL USERS
app.get("/api/users", async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

// GET ONE USER
app.get("/api/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// ADD USER (WITH IMAGE)
app.post("/api/users", upload.single("image"), async (req, res) => {
  try {
    const user = new User({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : ""
    });

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE INTEREST
app.put("/api/users/:id/toggle", async (req, res) => {
  const user = await User.findById(req.params.id);
  user.interested = !user.interested;
  await user.save();
  res.json(user);
});

// DELETE USER
app.delete("/api/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ======================
// 💬 CHAT ROUTES
// ======================

// SEND MESSAGE
app.post("/api/messages", async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET CHAT
app.get("/api/messages/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
});

// ======================
// 🚀 SERVER
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});