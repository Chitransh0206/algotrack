const db = require('../db/index');
const {
  updateLeaderboard,
  getLeaderboard,
  getUserRank,
} = require('../db/redis');

const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const start = (page - 1) * limit;
    const end = start + parseInt(limit) - 1;

    const entries = await getLeaderboard(start, end);

    if (!entries || entries.length === 0) {
      return res.json({ leaderboard: [], total: 0 });
    }

    const userIds = entries.map(e => e.value);

    const result = await db.query(
      `SELECT id, username, avatar_url
       FROM users
       WHERE id = ANY($1::uuid[])`,
      [userIds]
    );

    const userMap = {};
    result.rows.forEach(u => { userMap[u.id] = u; });

    const leaderboard = entries.map((entry, index) => ({
      rank: start + index + 1,
      user: userMap[entry.value],
      solved: entry.score,
    }));

    res.json({ leaderboard, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
};

const getFriendsLeaderboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT
        u.id,
        u.username,
        u.avatar_url,
        COUNT(us.id) as solved,
        s.current_streak
       FROM users u
       JOIN friendships f
         ON (f.requester_id = $1 AND f.addressee_id = u.id)
         OR (f.addressee_id = $1 AND f.requester_id = u.id)
       LEFT JOIN user_solutions us
         ON us.user_id = u.id AND us.status = 'solved'
       LEFT JOIN streaks s ON s.user_id = u.id
       WHERE f.status = 'accepted'
       GROUP BY u.id, u.username, u.avatar_url, s.current_streak
       UNION
       SELECT
         u.id,
         u.username,
         u.avatar_url,
         COUNT(us.id) as solved,
         s.current_streak
       FROM users u
       LEFT JOIN user_solutions us
         ON us.user_id = u.id AND us.status = 'solved'
       LEFT JOIN streaks s ON s.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id, u.username, u.avatar_url, s.current_streak
       ORDER BY solved DESC`,
      [userId]
    );

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      user: {
        id: row.id,
        username: row.username,
        avatar_url: row.avatar_url,
      },
      solved: parseInt(row.solved),
      current_streak: parseInt(row.current_streak) || 0,
      isYou: row.id === userId,
    }));

    res.json({ leaderboard });
  } catch (err) {
    next(err);
  }
};

const syncLeaderboard = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT user_id, COUNT(*) as solved
       FROM user_solutions
       WHERE status = 'solved'
       GROUP BY user_id`
    );

    for (const row of result.rows) {
      await updateLeaderboard(row.user_id, parseInt(row.solved));
    }

    res.json({ message: 'Leaderboard synced', count: result.rows.length });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGlobalLeaderboard,
  getFriendsLeaderboard,
  syncLeaderboard,
};