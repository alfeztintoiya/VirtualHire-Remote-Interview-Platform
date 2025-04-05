const Interview = require('../model/interview');

async function createInterview(req,res){
    try {
        const interview = new Interview(req.body);
        await interview.save();
        return res.status(201).json({ interview});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getAllInterview(req,res){
    try {
        const interviews  = await Interview.find().sort({ date: 1});
        return res.status(201).json({ status: true , interviews});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createInterview,
    getAllInterview
}