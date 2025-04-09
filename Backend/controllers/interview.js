const Interview = require('../model/interview');

async function createInterview(req,res){
    try {
        const { title, description, candidate, interviewer, date,time,meetingLink} = req.body;
        const interview = new Interview({
            title,
            description,
            candidate,
            interviewer,
            date,
            time,
            meetingLink,
            scheduledBy: req.user.id 
          });

        await interview.save();
        return res.status(201).json({ interview});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getAllInterview(req,res){

    if(req.user.role === "candidate"){
        try {
            const userEmailId = req.user.email;

            const interviews = await Interview.find({ candidate: userEmailId }).sort({ date: 1});
            res.status(201).json({ status: true, interviews });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }  
    else if(req.user.role === "recruiter") {
        try {
            const interviews  = await Interview.find({ scheduledBy: req.user.id }).sort({ date: 1});
            return res.status(201).json({ status: true , interviews});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
}

module.exports = {
    createInterview,
    getAllInterview
}