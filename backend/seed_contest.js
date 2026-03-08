const mongoose = require('mongoose');
const Contest = require('./models/Contest');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Contest ends in 7 days
        const votingDeadline = new Date(deadline.getTime() + 24 * 60 * 60 * 1000); // Voting ends 24 hours after that

        const contest = new Contest({
            title: 'The Whispering Shadows',
            description: 'The lamp flickered, not because the bulb was dying, but because something was draining the electricity from the air...',
            deadline: deadline,
            votingDeadline: votingDeadline,
            active: true
        });

        await contest.save();
        console.log('Sample contest created');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
