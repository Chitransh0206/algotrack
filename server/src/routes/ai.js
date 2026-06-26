const express = require('express');
const router = express.Router();
const {
  getHint,
  getInterviewQuestion,
  reviewSolution,
} = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// POST /api/ai/hint
router.post('/hint', getHint);

// POST /api/ai/interview-question
router.post('/interview-question', getInterviewQuestion);

// POST /api/ai/review
router.post('/review', reviewSolution);

module.exports = router;