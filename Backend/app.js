const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const {checkForAuthenticationCookie} = require('./middlewares/authentication')
const path = require('path')
const app = express()
const User = require("./model/user");
mongoose.connect("mongodb://127.0.0.1:27017/interview").then(()=>console.log("Mongodb Connected.."))
                                                            .catch(err => console.log("MongoDB Connection error.."));

require('./jobs/interviewStatusCron');
app.use(express.json());
app.use('/public', express.static('public'))
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
require("dotenv").config();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true, 
}));
// app.use(checkForAuthenticationCookie("token"));

//Routing Import
const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

app.use("/auth",authRoutes);
app.use("/interviews",interviewRoutes);

app.get("/candidates",async (req,res)=>{
    try {
        const candidate = await User.find({ role: "candidate" });
        return res.status(201).json({ candidate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 8011;
app.listen(PORT,()=>{ console.log(`Server Started at ${PORT}..`)});