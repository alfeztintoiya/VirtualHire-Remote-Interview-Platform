const mongoose = require('mongoose')
const {createHmac , randomBytes} = require('crypto');
const {createTokenForUser , validateToken} = require('../services/authentication')

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    salt:{
        type: String,
    },
    password:{
        type: String,
        required: true
    },
    collegeName: {
        type: String,
    },
    skills: {
        type: String,
    },
    companyName: {
        type: String,
    },
    designation: {
        type: String
    },
    industry: {
        type: String,
    },
    role:{
        type: String,
        enum: ['candidate' , 'recruiter'],
        default: "candidate"
    }
},{ timestamps: true});

UserSchema.pre("save", function(next){
    const user = this;
    
    if(!user.isModified("password"))return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256",salt).update(user.password).digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

UserSchema.static("matchPasswordAndGenerateToken",async function(email , password){
    const user = await this.findOne({ email });

    if(!user)throw new Error("User not Found..");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256",salt).update(password).digest("hex");

    if(userProvidedHash !== hashedPassword){
        throw new Error('Incorrect Password');
    }

    const token = createTokenForUser (user);
    return token;
})

const User = mongoose.model('user',UserSchema);

module.exports = User;