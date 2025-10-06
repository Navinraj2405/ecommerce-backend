 const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
require('dotenv').config();

const app = express();

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://navinraj2405.github.io",
  "ecommerce-front-end-project.netlify.app"
];

// ✅ CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked request from:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Middleware
app.use(express.json()); // replaces bodyParser.json()

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connection Successful"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define Schema
const addressSchema = new mongoose.Schema({
  newStreet: String,
  newLandmark: String,
  newArea: String,
  newAddress: String,
  newPincode: String,
  newCity: String,
});

const Address = mongoose.model('Address', addressSchema);

// ✅ POST Route (Add Address)
app.post('/api/address', async (req, res) => {
  const address = new Address({
    newStreet: req.body.newStreet,
    newLandmark: req.body.newLandmark,
    newArea: req.body.newArea,
    newAddress: req.body.newAddress,
    newPincode: req.body.newPincode,
    newCity: req.body.newCity,
  });

  try {
    const newAddress = await address.save();
    res.status(201).json(newAddress);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ GET Route (Fetch All Addresses)
app.get('/api/address', async (req, res) => {
  try {
    const addresses = await Address.find();
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ PUT Route (Update Address)
app.put('/api/address/:id', async (req, res) => {
  try {
    const updated = await Address.findByIdAndUpdate(
      req.params.id,
      {
        newStreet: req.body.newStreet,
        newLandmark: req.body.newLandmark,
        newArea: req.body.newArea,
        newAddress: req.body.newAddress,
        newPincode: req.body.newPincode,
        newCity: req.body.newCity,
      },
      { new: true } // return updated document
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ DELETE Route
app.delete('/api/address/:id', async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Start Server
app.listen(5000, () => console.log('🚀 Server running on port 5000'));
