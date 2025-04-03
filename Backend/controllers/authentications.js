const User  = require("../model/user")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


async function handleSignUpAuth(req,res){
    
    try {
        const {name , email , password} = req.body;

        let  entry = await User.findOne({email});
        if(entry){
            return res.status(500).json({ message: "User already exists.."});
        }

        const user = await User.create({
            name,
            email,
            password
        });

        return res.status(200).json({ status:true , user });
    } 
    catch (error) {
        res.status(500).json({ message: "Server Error.."});
    }
}

async function handleLoginAuth(req,res){
    try {
        const {email , password} = req.body;

        const token = await User.matchPasswordAndGenerateToken(email,password);
        const user = await User.findOne({ email });
        return res.cookie('token', token, {
            maxAge: 86400000, // 24 hours
            httpOnly: false,  // ✅ More secure
            secure: false,   // ✅ Set to true only in production (HTTPS)
            sameSite: 'Lax', // ✅ 'None' requires HTTPS, 'Lax' works locally
        }).status(200).json({ status: true, user });
    } catch (error) {
        return res.status(500).json({ message: "Server Error.."});
    }
}

module.exports = {
    handleSignUpAuth,
    handleLoginAuth
}