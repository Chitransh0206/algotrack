const express = require('express');
const router = express.Router();
const {
  getAllProblems,
  getProblemById,
  updateSolution,
  getTopics,
} = require('../controllers/problemController');
const { authenticate } = require('../middleware/auth');

// All routes protected
router.use(authenticate);

// GET /api/problems
router.get('/', getAllProblems);

// GET /api/problems/topics
router.get('/topics', getTopics);

// GET /api/problems/:id
router.get('/:id', getProblemById);

// PUT /api/problems/:id/solution
router.put('/:id/solution', updateSolution);

module.exports = router;