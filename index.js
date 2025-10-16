 // server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
require('dotenv').config();

const app = express();

// ==================== CORS ====================
const allowedOrigins = [
  "http://localhost:5173",
  "https://navinraj2405.github.io",
  "https://ecommerce-front-end-project.netlify.app",
  "https://onlineshoping-project.netlify.app"
];

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

// ==================== MIDDLEWARE ====================
app.use(express.json());

// ==================== MONGODB ====================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ==================== SCHEMAS ====================

// Address Schema
const addressSchema = new mongoose.Schema({
  newStreet: String,
  newLandmark: String,
  newArea: String,
  newAddress: String,
  newPincode: String,
  newCity: String,
  userId: { type: String, required: true } // tie to logged-in user
});
const Address = mongoose.model('Address', addressSchema);

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 },
  userId: { type: String, required: true } // tie to logged-in user
});
const CartItem = mongoose.model("CartItem", cartItemSchema);

// ==================== ADDRESS ROUTES ====================

// POST: Add new address
app.post('/api/address', async (req, res) => {
  const { newStreet, newLandmark, newArea, newAddress, newPincode, newCity, userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const address = new Address({ newStreet, newLandmark, newArea, newAddress, newPincode, newCity, userId });
    const saved = await address.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET: Fetch addresses for a specific user
app.get('/api/address/:userId', async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.params.userId });
    res.json(addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// PUT: Update address (user-specific)
app.put('/api/address/:id', async (req, res) => {
  const { userId, newStreet, newLandmark, newArea, newAddress, newPincode, newCity } = req.body;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const updated = await Address.findOneAndUpdate(
      { _id: req.params.id, userId },
      { newStreet, newLandmark, newArea, newAddress, newPincode, newCity },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Address not found or unauthorized" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Remove address (user-specific)
app.delete('/api/address/:id', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const deleted = await Address.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) return res.status(404).json({ message: "Address not found or unauthorized" });
    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== CART ROUTES ====================

// POST: Add item to cart or update quantity
app.post("/api/cart", async (req, res) => {
  const { productId, title, price, image, quantity, userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    let existingItem = await CartItem.findOne({ productId, userId });
    if (existingItem) {
      existingItem.quantity += quantity;
      const updated = await existingItem.save();
      return res.status(200).json(updated);
    }
    const cartItem = new CartItem({ productId, title, price, image, quantity, userId });
    const saved = await cartItem.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET: Fetch cart items for a user
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.params.userId });
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: Update cart item quantity (user-specific)
app.put("/api/cart/:id", async (req, res) => {
  const { quantity, userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const updatedItem = await CartItem.findOneAndUpdate(
      { _id: req.params.id, userId },
      { quantity },
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ message: "Cart item not found or unauthorized" });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Remove cart item (user-specific)
app.delete("/api/cart/:id", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const deleted = await CartItem.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) return res.status(404).json({ message: "Cart item not found or unauthorized" });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
