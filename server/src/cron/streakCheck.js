const cron = require('node-cron');
const db = require('../db/index');

const checkStreaks = async () => {
  try {
    // Reset streak if user didn't solve yesterday
    const result = await db.query(
      `UPDATE streaks
       SET current_streak = 0,
           updated_at = NOW()
       WHERE last_solved_date < CURRENT_DATE - INTERVAL '1 day'
         AND current_streak > 0
       RETURNING user_id`
    );

    if (result.rows.length > 0) {
      console.log(`⚠️ Streak reset for ${result.rows.length} users`);
    } else {
      console.log('✅ All streaks intact');
    }
  } catch (err) {
    console.error('❌ Streak check error:', err);
  }
};

// Runs every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('🔍 Checking streaks...');
  checkStreaks();
});

module.exports = { checkStreaks };