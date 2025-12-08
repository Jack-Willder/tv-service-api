const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// ----- MongoDB Connection -----
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tv-service-shop";

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ----- Job Schema -----
const jobSchema = new mongoose.Schema(
  {
    customerName: String,
    phone: String,
    address: String,
    tvBrand: String,
    tvModel: String,
    problem: String,
    serviceType: String,
    problemReceiveDate: String,
    estimatedDeliveryDate: String,
    amount: String,
    paymentStatus: String,
    status: { type: String, default: "Received" },
    createdAt: { type: String },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

// ----- API ROUTES -----

// Simple test route
app.get("/api", (req, res) => {
  res.send("TV Service API is running ✅");
});

// Get all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    const formatted = jobs.map((job) => ({
      id: job._id.toString(),
      ...job.toObject(),
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

// Create a new job
app.post("/api/jobs", async (req, res) => {
  try {
    const data = req.body;

    const job = new Job({
      ...data,
      createdAt: new Date().toLocaleString(),
      status: data.status || "Received",
    });

    const saved = await job.save();

    res.status(201).json({
      id: saved._id.toString(),
      ...saved.toObject(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating job" });
  }
});

// Update job (status, payment, etc.)
app.patch("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await Job.findByIdAndUpdate(id, updates, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      id: updated._id.toString(),
      ...updated.toObject(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating job" });
  }
});

// Delete job
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Job.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting job" });
  }
});

// ----- SERVE FRONTEND (React build) -----

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "frontend")));

// Serve index.html on root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
