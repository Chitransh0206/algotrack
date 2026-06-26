const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyProblems,
} = require('../controllers/companyController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/companies
router.get('/', getAllCompanies);

// GET /api/companies/:slug/problems
router.get('/:slug/problems', getCompanyProblems);

module.exports = router;