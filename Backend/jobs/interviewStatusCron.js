const cron = require('node-cron');
const Interview = require('../model/interview');

cron.schedule('*/10 * * * * *',async ()=>{
    try{
        const now = new Date();

        const interviews = await Interview.find({ status: 'Upcoming' });

        for (let interview of interviews) {
        const interviewDateTime = new Date(interview.date); 
        const [hours, minutes] = interview.time.split(':');

        interviewDateTime.setHours(hours);
        interviewDateTime.setMinutes(minutes);
        interviewDateTime.setSeconds(0);

        const diffInMinutes = (now - interviewDateTime) / 60000;

        
            if (diffInMinutes >= 0 && diffInMinutes <= 2) {
                interview.status = 'Live Now';
                await interview.save();
                console.log(`Interview ${interview._id} is now Live.`);
            }
            else if(diffInMinutes >= 10){
                interview.status = 'Cancelled';
                await interview.save();
                console.log(`Interview ${interview._id} is now Live.`);
            }
        }

    }
    catch(error){
        console.error('Cron Job Error:', err.message);
    }
});
