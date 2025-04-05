const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    candidate: {
        type: String,
        required: true,
    },
    interviewer: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Upcoming","Live Now","Completed"],
        default: "Upcoming",
    }
}, { timestamps: true });

const Interview = mongoose.model('interview',interviewSchema);

module.exports = Interview;