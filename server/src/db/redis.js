const { createClient } = require('redis');

const client = createClient({ url: process.env.REDIS_URL });

client.on('connect', () => console.log('✅ Redis connected'));
client.on('error', (err) => console.error('❌ Redis error:', err));

const connectRedis = async () => {
  await client.connect();
};

const setCache = async (key, value, ttlSeconds = 300) => {
  await client.setEx(key, ttlSeconds, JSON.stringify(value));
};

const getCache = async (key) => {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

const deleteCache = async (key) => {
  await client.del(key);
};

const updateLeaderboard = async (userId, score) => {
  await client.zAdd('leaderboard:global', [{ score, value: userId }]);
};

const getLeaderboard = async (start = 0, end = 9) => {
  return await client.zRangeWithScores('leaderboard:global', start, end, { REV: true });
};

const getUserRank = async (userId) => {
  return await client.zRevRank('leaderboard:global', userId);
};

module.exports = {
  client,
  connectRedis,
  setCache,
  getCache,
  deleteCache,
  updateLeaderboard,
  getLeaderboard,
  getUserRank,
};