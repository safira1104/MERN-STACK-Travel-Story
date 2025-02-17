const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors({origin: "*"}));

// Test API
app.get("/hello", async (req, res) => {
    return res.status(200).json({ message: "hello" });  // Perbaiki bagian ini
});

app.listen(8000);

module.exports = app;
