const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()

mongoose.connect("mongodb://127.0.0.1:27017/interview").then(()=>console.log("Mongodb Connected.."))
                                                            .catch(err => console.log("MongoDB Connection error.."));

app.use(cors());
app.use(express.json());
app.use(cookieParser());

//Routing Import
const authRoutes = require("./routes/authRoutes")

app.use("/auth",authRoutes);


const PORT = 8011;
app.listen(PORT,()=>{ console.log(`Server Started at ${PORT}..`)});