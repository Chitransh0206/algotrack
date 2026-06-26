const express = require('express');
const router = express.Router();
const {
  getGlobalLeaderboard,
  getFriendsLeaderboard,
  syncLeaderboard,
} = require('../controllers/leaderboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/leaderboard/global
router.get('/global', getGlobalLeaderboard);

// GET /api/leaderboard/friends
router.get('/friends', getFriendsLeaderboard);

// POST /api/leaderboard/sync
router.post('/sync', syncLeaderboard);

module.exports = router;