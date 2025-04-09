const JWT = require('jsonwebtoken')
require("dotenv").config();
const secret = process.env.secretKey || "$piderMan@3786";
function createTokenForUser(user){
    const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const token  = JWT.sign(payload,secret);
    return token;
}

function validateToken(token){
    const payload = JWT.verify(token,secret);
    
    return payload;
}

module.exports = {
    createTokenForUser,
    validateToken
};