const express = require('express')
const router  = express.Router();

const {createInterview , getAllInterview} = require('../controllers/interview');

router.get("/",getAllInterview);
router.post("/",createInterview);


module.exports = router;