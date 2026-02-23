const mongoose = require('mongoose');
const Contest = require('./models/Contest');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Create a sample contest
        const contest = new Contest({
            title: 'The Whispering Shadows',
            description: 'The lamp flickered, not because the bulb was dying, but because something was draining the electricity from the air...',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
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
