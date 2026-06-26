const db = require('../db/index');
const { getCache, setCache } = require('../db/redis');

const getAllCompanies = async (req, res, next) => {
  try {
    const cached = await getCache('companies:all');
    if (cached) return res.json(cached);

    const result = await db.query(
      `SELECT c.*,
        COUNT(cp.problem_id) as total_problems
       FROM companies c
       LEFT JOIN company_problems cp ON c.id = cp.company_id
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    await setCache('companies:all', result.rows, 3600);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getCompanyProblems = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user.userId;

    const cacheKey = `company:${slug}:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const companyResult = await db.query(
      `SELECT * FROM companies WHERE slug = $1`,
      [slug]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companyResult.rows[0];

    const problemsResult = await db.query(
      `SELECT p.*,
        cp.frequency,
        us.status as user_status,
        us.solved_at
       FROM problems p
       JOIN company_problems cp ON p.id = cp.problem_id
       LEFT JOIN user_solutions us
         ON p.id = us.problem_id AND us.user_id = $1
       WHERE cp.company_id = $2
       ORDER BY cp.frequency DESC, p.difficulty ASC`,
      [userId, company.id]
    );

    const response = {
      company,
      problems: problemsResult.rows,
      total: problemsResult.rows.length,
      solved: problemsResult.rows.filter(p => p.user_status === 'solved').length,
    };

    await setCache(cacheKey, response, 600);

    res.json(response);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCompanies, getCompanyProblems };