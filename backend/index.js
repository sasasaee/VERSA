const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const notificationRoutes = require('./routes/notifications'); // ADD THIS
require('dotenv').config();

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
app.use('/api/notifications', notificationRoutes); // ADD THIS

app.get('/', (req, res) => {
  res.send('Versa API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
