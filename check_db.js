const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const User = require('./backend/models/User');
const Story = require('./backend/models/Story');

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/versa');
        console.log("Connected to DB");

        const usersWithSaves = await User.find({ savedStories: { $gt: [] } });
        console.log(`Users with saved stories: ${usersWithSaves.length}`);

        usersWithSaves.forEach(u => {
            console.log(`User: ${u.username} (${u._id})`);
            console.log(`  Saved Stories Count: ${u.savedStories.length}`);
            console.log(`  IDs: ${u.savedStories.join(', ')}`);
        });

        // Check if those stories actually exist
        if (usersWithSaves.length > 0) {
            const storyIds = usersWithSaves[0].savedStories;
            const stories = await Story.find({ _id: { $in: storyIds } });
            console.log(`Stories found in DB for the first user: ${stories.length}`);
            stories.forEach(s => console.log(`  - ${s.title} (${s._id})`));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
