const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Story = require('./models/Story');
const User = require('./models/User');

async function debugData() {
    try {
        console.log('Using MONGO_URI:', process.env.MONGO_URI ? 'FOUND' : 'NOT FOUND');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const stories = await Story.find().sort({ createdAt: -1 }).limit(10);
        console.log('\n--- Latest 10 Stories ---');
        stories.forEach(s => {
            console.log(`ID: ${s._id} | Title: "${s.title}" | Author: ${s.author} (Type: ${typeof s.author})`);
        });

        const users = await User.find().limit(10);
        console.log('\n--- Latest 10 Users ---');
        users.forEach(u => {
            console.log(`ID: ${u._id} | Username: "${u.username}"`);
        });

        await mongoose.disconnect();
        console.log('\nDisconnected');
    } catch (err) {
        console.error('Debug Script Error:', err);
    }
}

debugData();
