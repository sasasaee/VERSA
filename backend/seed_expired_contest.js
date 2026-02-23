const mongoose = require('mongoose');
const Contest = require('./models/Contest');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Set all previous contests to inactive
        await Contest.updateMany({}, { active: false });

        // Create an expired contest
        const contest = new Contest({
            title: 'The Silent Library (Expired Test)',
            description: 'You enter a library where every book is blank, until you touch it...',
            deadline: new Date(Date.now() - 3600000), // 1 hour ago
            active: true
        });

        await contest.save();
        console.log('Expired test contest created successfully');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
