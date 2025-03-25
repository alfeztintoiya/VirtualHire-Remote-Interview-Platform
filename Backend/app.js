const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')


const app = express()

mongoose.connect("mongodb://127.0.0.1:27017/interview").then((e)=>console.log("Mongodb Connected.."));

app.use(cors());
app.use(express.json());

//Routing Import
const authRoutes = require("./routes/authRoutes")

app.use("/auth",authRoutes);


const PORT = 8005;
app.listen(PORT,()=>{ console.log(`Server Started at ${PORT}..`)});