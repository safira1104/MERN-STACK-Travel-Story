require("dotenv").config();

const config = require("./config.json");

const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");


const jwt = require("jsonwebtoken");
const { mongoose } = require("mongoose");
const {authenticateToken} = require("./utilities");

const User = require("./models/user.model");
const TravelStory = require("./models/travelstory.model");
const { error } = require("console");

mongoose.connect(config.connectionString);


const app = express();

app.use(express.json());
app.use(cors({origin: "*"}));

// Create Account
app.post("/create-account", async (req, res) => {
    const {fullName, email, password} = req.body;

    if(!fullName || !email || !password){
        return res
            .status(400)
            .json({ error: true, message: "All fields are ruquired" });
    }

    const isUser = await User.findOne({email});
    if (isUser) {
        return res
            .status(400)
            .json({error: true, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        fullName,
        email,
        password:hashedPassword,
    });

    await user.save();

    const  accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "72h",
        }
    );

    return res.status(201).json({
        error: false,
        user: {fullName: user.fullName, email: user.email},
        accessToken,
        message: "Registration Successfull",
    });
            
});

// Login 
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(!isPasswordValid) {
        return res.status(400).json({message: "Invalid Credentials"});
    }

    const accessToken = jwt.sign(
        {userId: user._id},
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:"72h",
        }
    );

    return res.json({
        error: false,
        message: "Login Successful",
        user: { fullName: user.fullName, email: user.email},
        accessToken,
    });
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
    const { userId} = req.user;

    const isUser = await User.findOne({_id: userId});

    if(!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: isUser,
        message: "",
    });
});

//Route to handle image upload
app.post("/image-upload", upload.single("image"), async (req, res) => {
    try{
        if(!req.file){
            return res
            .status(400)
            .json({error: true, message: "No image uploaded"});
        }

        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;

        res.status(201).json({imageUrl});
    }catch(error){
        res.status(500).json({error: true, message: error.message});
    }
});

// Delete an image from uploads folder
app.delete("/delete-image", async (req, res) => {
    const {imageUrl} = req.query;

    if(!imageUrl){
        return res.status(400).json({error: true, message: "Image parameter is required"});
    }

    try{
        //Extract the filename from the imageUrl
        const filename = path.basename(imageUrl);

        //Define the file path 
        const filePath = path.join(__dirname, 'uploads', filename);

        //Check if the file exists
        if(fs.existsSync(filePath)){
            //Delete the file from the uploads folder
            fs.unlinkSync(filePath);
            res.status(200).json({ message: "Image deleted successfully"});
        }else{
            res.status(200).json({ error: true, message: "Image not found"});
        }
    }catch(error){
        res.status(500).json({error: true, message: error.message});
    }
});

// Serve static files from the uploads and assets directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));


// Add Travel Story
app.post("/add-travel-story", authenticateToken, async (req, res) => {
    const {title, story, visitedLocation, imageUrl, visitedDate} = req.body;
    const {userId} = req.user

    //Validate required fields
    if(!title || !story || !visitedLocation || !imageUrl || !visitedDate){
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    //Convert visitedDate from milliseconds to Date object
    const parsedVisitedDate = new Date(parseInt(visitedDate));

    try{
        const travelStory = new TravelStory({
            title, 
            story,
            visitedLocation,
            userId,
            imageUrl,
            visitedDate: parsedVisitedDate,
        });

        await travelStory.save();
        res.status(201).json({story: travelStory, message:'Added Successfully'});
    }catch(error){
        res.status(400).json({ error: true, message: error.message});
    }
});


//Get All Travel Stories
app.get("/get-all-stories", authenticateToken, async (req, res) => {
    const { userId } = req.user;
    try{
        const travelStories = await TravelStory.find({userId:userId}).sort({isFavourite: -1});
        res.status(200).json({stories: travelStories});
    }catch(error){
        res.status(500).json({error: true, message: error.message});
    }
});


app.listen(8000);

module.exports = app;
