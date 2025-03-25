const User  = require("../model/user")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


async function handleSignUpAuth(req,res){
    try {
        const {name , email , password , role} = req.body;

        let  entry = await User.findOne({email});
        if(entry){
            return res.status(500).json({ message: "User already exists.."});
        }

        await User.create({
            name,
            email,
            password,
            role
        });

        return res.status(200).json({ message: "User Created Successfully."});
    } 
    catch (error) {
        res.status(500).json({ message: "Server Error.."});
    }
}

async function handleLoginAuth(req,res){
    try {
        const {email , password} = req.body;

        const token = await User.matchPasswordAndGenerateToken(email,password);
        return res.cookies("token",token).status(200).json({ message: "User Login Successfully."});
    } catch (error) {
        return res.status(500).json({ message: "Server Error.."});
    }
}

module.exports = {
    handleSignUpAuth,
    handleLoginAuth
}