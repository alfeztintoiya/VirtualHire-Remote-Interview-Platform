const express = require('express')
const {handleSignUpAuth, handleLoginAuth} = require('../controllers/authentications')


const router = express.Router();


router.post("/signup",handleSignUpAuth);
router.post("/login",handleLoginAuth);


module.exports = router;