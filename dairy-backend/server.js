console.log('Starting server...');
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes = require('./routes/auth');
const cowRoutes  = require('./routes/cows');
const milkRoutes = require('./routes/milk');
const breedingRoutes = require('./routes/breeding');
const notificationRoutes = require('./routes/notifications');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://dairy-farm-t5yb-git-main-ianmac9s-projects.vercel.app',
    'https://dairy-farm-t5yb.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cows', cowRoutes);
app.use('/api/milk', milkRoutes);
app.use('/api/breeding', breedingRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🐄 Dairy Farm API running on http://localhost:${PORT}`);
});
