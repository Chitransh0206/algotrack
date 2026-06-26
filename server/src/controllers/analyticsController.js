const db = require('../db/index');
const { getCache, setCache } = require('../db/redis');

const getStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const cacheKey = `analytics:stats:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const solvedResult = await db.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN p.difficulty = 'Easy' THEN 1 END) as easy,
        COUNT(CASE WHEN p.difficulty = 'Medium' THEN 1 END) as medium,
        COUNT(CASE WHEN p.difficulty = 'Hard' THEN 1 END) as hard
       FROM user_solutions us
       JOIN problems p ON p.id = us.problem_id
       WHERE us.user_id = $1 AND us.status = 'solved'`,
      [userId]
    );

    const streakResult = await db.query(
      `SELECT current_streak, longest_streak, last_solved_date
       FROM streaks WHERE user_id = $1`,
      [userId]
    );

    const topicResult = await db.query(
      `SELECT p.topic, COUNT(*) as count
       FROM user_solutions us
       JOIN problems p ON p.id = us.problem_id
       WHERE us.user_id = $1 AND us.status = 'solved'
       GROUP BY p.topic
       ORDER BY count DESC`,
      [userId]
    );

    const weeklyResult = await db.query(
      `SELECT
        DATE(us.solved_at) as date,
        COUNT(*) as count
       FROM user_solutions us
       WHERE us.user_id = $1
         AND us.solved_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(us.solved_at)
       ORDER BY date ASC`,
      [userId]
    );

    const response = {
      solved: solvedResult.rows[0],
      streak: streakResult.rows[0] || { current_streak: 0, longest_streak: 0 },
      byTopic: topicResult.rows,
      lastWeek: weeklyResult.rows,
    };

    await setCache(cacheKey, response, 600);

    res.json(response);
  } catch (err) {
    next(err);
  }
};

const getHeatmap = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT
        DATE(solved_at) as date,
        COUNT(*) as count
       FROM user_solutions
       WHERE user_id = $1
         AND solved_at >= NOW() - INTERVAL '365 days'
       GROUP BY DATE(solved_at)
       ORDER BY date ASC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getHeatmap };