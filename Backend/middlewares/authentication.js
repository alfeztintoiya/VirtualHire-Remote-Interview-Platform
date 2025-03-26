const {validateToken} = require("../services/authentication")

function checkForAuthenticationCookie(cookieName){
    return (req,res,next)=>{
        const tokenCookieValue = req.cookies[cookieName];

        if(!tokenCookieValue){
            return next();
        }

        try {
            const UserPayload = validateToken(tokenCookieValue);
            return UserPayload;
        } catch (error) {}

        return next();
    };
}

module.exports = {
    checkForAuthenticationCookie
}