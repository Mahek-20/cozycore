const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

app.get("/Healthform_html.html", (req, res) => {
  res.sendFile(path.join(__dirname, "Healthform_html.html"));
});


// Serve static files manually (e.g., style.css)
app.get("/css/index-style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "index-style.css"));
});

 
// MongoDB Atlas connection
const mongoURI = "mongodb+srv://mahekvesuwala200704:xQblvhup0wKZN9Ad@cluster0.ntyc54m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  Firstname: String,
  Lastname: String,
  email: String,
  number: String,
  password: String,
});

const User = mongoose.model("User", userSchema);


// ===================== ROUTES ===================== //

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { Firstname, Lastname, email, number, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered." });
    }

    const newUser = new User({ Firstname, Lastname, email, number, password });
    await newUser.save();

    res.json({ success: true, message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error." });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ email: username });

    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.password !== password) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Server error" });
  }
});

// HealthForm Schema
const healthFormSchema = new mongoose.Schema({
  name: String,
  dob: String,
  age: Number,
  height: Number,
  weight: Number,
  fitness: String,
  stressLevel: Number,
  health: String,
  practice: String,
  oftenPractice: String,
  yogaStyles: [String],
  goals: [String],
  interests: [String],
});

const HealthForm = mongoose.model("HealthForm", healthFormSchema);

// POST Route to submit health form
app.post("/submit-healthform", async (req, res) => {
  try {
    const formData = new HealthForm({
      ...req.body,
      yogaStyles: [].concat(req.body.yogaStyles || []),
      goals: [].concat(req.body.goals || []),
      interests: [].concat(req.body.interests || []),
    });

    await formData.save();
    res.json({ success: true, message: "Health form submitted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving data." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});



// Catch-all route (optional: serve index.html or 404)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});

// MongoDB error listener
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});
