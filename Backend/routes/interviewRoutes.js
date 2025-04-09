const express = require('express')
const router  = express.Router();
const Interview = require("../model/interview");
const {createInterview , getAllInterview} = require('../controllers/interview');
const {checkForAuthenticationCookie} = require("../middlewares/authentication")

router.get("/",checkForAuthenticationCookie("token"),getAllInterview);
router.post("/",checkForAuthenticationCookie("token"),createInterview);
router.get("/complete/:meetingLink",async (req,res)=>{
    try {
        const { meetingLink } = req.params;
        console.log(meetingLink);
        const interview = await Interview.findOneAndUpdate(
          { meetingLink }, // match based on the link
          { status: 'Completed' },
          { new: true }
        );

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        res.json({ message: 'Interview marked as completed', interview });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;