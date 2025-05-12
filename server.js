const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors()); // Enable CORS for all requests
app.use(express.json());

// MongoDB connection using Client URI
const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}
connectDB();

// Database reference
const db = client.db("ShoppyGlobe"); // Replace with your database name
const usersCollection = db.collection("users");
const productsCollection = db.collection("productsCollections");
const cartCollection = db.collection("cartCollection"); // Added cart collection reference

// User Registration Route
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        await usersCollection.insertOne({ name, email, password });
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// User Login Route
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await usersCollection.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Retrieve Product Route
app.get("/retrieveproduct", async (req, res) => {
    try {
        const products = await productsCollection.find().toArray();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Add Product Route
app.post("/addproduct", async (req, res) => {
    try {
        const { name, id, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        await productsCollection.insertOne({ name, id , description });
        res.status(201).json({ message: "Product added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Add to Cart Route
app.post("/addtocart", async (req, res) => {
    try {
        const { productId, productName, productDiscription, userId, useremail } = req.body;

        if (!productId || !productName || !userId || !useremail) {
            return res.status(400).json({ message: "All fields are required" });
        }

        await cartCollection.insertOne({ productId, productName, productDiscription, userId, useremail });
        res.status(201).json({ message: "Product added to cart successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

//Retrieve Cart Route
app.get("/retriveCart/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const cartItems = await cartCollection.find({ userId }).toArray();
        if (cartItems.length === 0) {
            return res.status(404).json({ message: "No items found in cart" });
        }

        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// app.get("/retriveCart/:useremail", async (req, res) => {
//     try {
//         const { useremail } = req.params;

//         const cartItems = await cartCollection.find({ useremail }).toArray();
//         if (cartItems.length === 0) {
//             return res.status(404).json({ message: "No items found in cart for this email" });
//         }

//         res.status(200).json(cartItems);
//     } catch (error) {
//         res.status(500).json({ message: "Internal server error" });
//     }
// });
