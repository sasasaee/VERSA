require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const notificationRoutes = require('./routes/notifications');
const contestRoutes = require('./routes/contests');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

//routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/user', require('./routes/user'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/follow', require('./routes/follow'));
app.use('/api/contests', contestRoutes);

// =========== Weekly Contest Automated Cron Job ===========
const cron = require('node-cron');
const Contest = require('./models/Contest');
const { getRandomPrompt } = require('./utils/contestPrompts');

// Runs every hour at minute 0 (e.g. 1:00, 2:00, etc)
cron.schedule('0 * * * *', async () => {
  try {
    const latestContest = await Contest.findOne({ active: true }).sort({ createdAt: -1 });

    if (latestContest) {
      // Check if voting has officially ended
      if (new Date() > new Date(latestContest.votingDeadline)) {
        console.log(`[Cron] Contest '${latestContest.title}' has finished its voting period. Deactivating...`);
        latestContest.active = false;
        await latestContest.save();
      } else {
        // Active contest is still ongoing, do nothing
        return;
      }
    }

    // Check if we already have an active contest
    const anyActive = await Contest.findOne({ active: true });
    if (!anyActive) {
      console.log('[Cron] No active contest found. Generating a new one...');
      
      const prompt = getRandomPrompt();
      const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days for submission
      const votingDeadline = new Date(deadline.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 extra day for voting
      
      const newContest = new Contest({
        title: prompt.title,
        description: prompt.description,
        deadline: deadline,
        votingDeadline: votingDeadline,
        active: true
      });

      await newContest.save();
      console.log(`[Cron] Successfully started new contest: '${newContest.title}'`);
    }

  } catch (error) {
    console.error('[Cron] Error running automated contest check:', error);
  }
});
// ========================================================

app.get('/', (req, res) => {
  res.send('Versa API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
