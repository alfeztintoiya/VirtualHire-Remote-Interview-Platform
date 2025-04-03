const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const {checkForAuthenticationCookie} = require('./middlewares/authentication')
const path = require('path')
const app = express()

mongoose.connect("mongodb://127.0.0.1:27017/interview").then(()=>console.log("Mongodb Connected.."))
                                                            .catch(err => console.log("MongoDB Connection error.."));


app.use(express.json());
app.use('/public', express.static('public'))
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies)
}));
// app.use(checkForAuthenticationCookie("token"));

//Routing Import
const authRoutes = require("./routes/authRoutes")

app.use("/auth",authRoutes);


const PORT = 8011;
app.listen(PORT,()=>{ console.log(`Server Started at ${PORT}..`)});