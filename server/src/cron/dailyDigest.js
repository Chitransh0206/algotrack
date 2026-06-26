const cron = require('node-cron');
const nodemailer = require('nodemailer');
const db = require('../db/index');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendDailyDigest = async () => {
  try {
    const usersResult = await db.query(
      `SELECT u.id, u.email, u.username,
        s.current_streak
       FROM users u
       JOIN streaks s ON s.user_id = u.id`
    );

    const problemsResult = await db.query(
      `SELECT * FROM problems
       ORDER BY RANDOM()
       LIMIT 3`
    );

    for (const user of usersResult.rows) {
      const problemList = problemsResult.rows
        .map(p => `• ${p.title} (${p.difficulty}) — ${p.url}`)
        .join('\n');

      await transporter.sendMail({
        from: `"AlgoTrack" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `🔥 Day ${user.current_streak} — Your Daily Problems`,
        text: `Hey ${user.username}!\n\nYour streak: ${user.current_streak} days 🔥\n\nToday's problems:\n${problemList}\n\nKeep grinding!\n— AlgoTrack`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:auto;">
            <h2>Hey ${user.username}! 👋</h2>
            <p>Your current streak: <strong>${user.current_streak} days 🔥</strong></p>
            <h3>Today's Problems</h3>
            <ul>
              ${problemsResult.rows.map(p => `
                <li>
                  <a href="${p.url}">${p.title}</a>
                  <span style="color:${p.difficulty === 'Easy' ? 'green' : p.difficulty === 'Medium' ? 'orange' : 'red'}">
                    (${p.difficulty})
                  </span>
                </li>
              `).join('')}
            </ul>
            <p>Keep grinding! 💪</p>
            <p style="color:#999;font-size:12px;">— AlgoTrack Team</p>
          </div>
        `,
      });
    }

    console.log(`✅ Daily digest sent to ${usersResult.rows.length} users`);
  } catch (err) {
    console.error('❌ Daily digest error:', err);
  }
};

// Runs every day at 8:00 AM
cron.schedule('0 8 * * *', () => {
  console.log('📧 Running daily digest...');
  sendDailyDigest();
});

module.exports = { sendDailyDigest };