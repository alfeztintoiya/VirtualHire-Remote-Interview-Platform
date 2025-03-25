const User = require("../model/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const express = require('express')
const router = express.Router();

const {handleSignUpAuth, handleLoginAuth} = require('../controllers/authentications')


router.post("/signup",handleSignUpAuth);
router.post("/login",handleLoginAuth);

module.exports = router;