const db = require('../db/index');
const { setCache, getCache, deleteCache } = require('../db/redis');

const getAllProblems = async (req, res, next) => {
  try {
    const { difficulty, topic, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.userId;

    const cacheKey = `problems:${userId}:${difficulty || 'all'}:${topic || 'all'}:${page}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    let query = `
      SELECT p.*,
        us.status as user_status,
        us.notes,
        us.solved_at
      FROM problems p
      LEFT JOIN user_solutions us
        ON p.id = us.problem_id AND us.user_id = $1
      WHERE 1=1
    `;

    const params = [userId];
    let paramIndex = 2;

    if (difficulty) {
      query += ` AND p.difficulty = $${paramIndex++}`;
      params.push(difficulty);
    }

    if (topic) {
      query += ` AND p.topic = $${paramIndex++}`;
      params.push(topic);
    }

    if (status) {
      query += ` AND us.status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY p.leetcode_number ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const countResult = await db.query(
      `SELECT COUNT(*) FROM problems`,
    );

    const response = {
      problems: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    };

    await setCache(cacheKey, response, 300);

    res.json(response);
  } catch (err) {
    next(err);
  }
};

const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT p.*,
        us.status as user_status,
        us.notes,
        us.time_complexity,
        us.space_complexity,
        us.language,
        us.solved_at
       FROM problems p
       LEFT JOIN user_solutions us
         ON p.id = us.problem_id AND us.user_id = $1
       WHERE p.id = $2`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateSolution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { status, notes, time_complexity, space_complexity, language } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await db.query(
      `INSERT INTO user_solutions
        (user_id, problem_id, status, notes, time_complexity, space_complexity, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, problem_id)
       DO UPDATE SET
         status = $3,
         notes = $4,
         time_complexity = $5,
         space_complexity = $6,
         language = $7,
         updated_at = NOW()
       RETURNING *`,
      [userId, id, status, notes, time_complexity, space_complexity, language]
    );

    // Update streak
    await db.query(
      `UPDATE streaks SET
         last_solved_date = CURRENT_DATE,
         current_streak = CASE
           WHEN last_solved_date = CURRENT_DATE - INTERVAL '1 day'
           THEN current_streak + 1
           WHEN last_solved_date = CURRENT_DATE
           THEN current_streak
           ELSE 1
         END,
         longest_streak = GREATEST(longest_streak,
           CASE
             WHEN last_solved_date = CURRENT_DATE - INTERVAL '1 day'
             THEN current_streak + 1
             ELSE 1
           END),
         updated_at = NOW()
       WHERE user_id = $1`,
      [userId]
    );

    // Invalidate cache
    await deleteCache(`problems:${userId}:all:all:1`);

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const getTopics = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT topic FROM problems WHERE topic IS NOT NULL ORDER BY topic`
    );
    res.json(result.rows.map(r => r.topic));
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllProblems, getProblemById, updateSolution, getTopics };