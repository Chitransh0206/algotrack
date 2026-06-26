require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectRedis } = require('./db/redis');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const analyticsRoutes = require('./routes/analytics');
const companyRoutes = require('./routes/companies');
const leaderboardRoutes = require('./routes/leaderboard');
const aiRoutes = require('./routes/ai');

require('./cron/dailyDigest');
require('./cron/streakCheck');

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'AI hint limit reached. Try again in a minute.' },
});
app.use('/api/ai', aiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();