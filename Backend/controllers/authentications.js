const User  = require("../model/user")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function handleSignUpAuth(req,res){
    
    try {
        const { name, email, password, role, collegeName, skills, companyName, designation, industry } = req.body;

        if(!name || !email || !password || !role){
            return res.status(400).json({ mesaage: "Missing required field."});
        }

        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(409).json({ message: "Email already registered."});
        }
        
        let userData = {
            name,
            email,
            password,
            role
        };

        if(role === "candidate"){
            userData = { ...userData , collegeName , skills};
        }
        else if(role === "recruiter"){
            userData = { ...userData , companyName , designation , industry };
        }
        else{
            return res.status(400).json({ message: "Invalid role selected."});
        }

        const newUser = await User.create(userData);
        return res.status(201).json({ status:true , user: newUser });
    } 
    catch (error) {
        console.log("Signup Error: ",error);
        res.status(500).json({ message: "Server Error."});
    }
}

async function handleLoginAuth(req,res){
    try {
        const {email , password} = req.body;

        const token = await User.matchPasswordAndGenerateToken(email,password);
        const user = await User.findOne({ email });
        return res.cookie('token', token, {
            maxAge: 86400000, // 24 hours
            httpOnly: false,  
            secure: false,   
            sameSite: 'Lax', 
        }).status(200).json({ status: true, user });
    } catch (error) {
        return res.status(500).json({ message: "Server Error.."});
    }
}

module.exports = {
    handleSignUpAuth,
    handleLoginAuth
}