const db = require('../db/index');

const getHint = async (req, res, next) => {
  try {
    const { problemId, hintLevel = 1 } = req.body;

    if (!problemId) {
      return res.status(400).json({ error: 'Problem ID is required' });
    }

    const result = await db.query(
      `SELECT title, difficulty, topic FROM problems WHERE id = $1`,
      [problemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problem = result.rows[0];

    const hintPrompts = {
      1: `Give a very subtle hint for the LeetCode problem "${problem.title}" (${problem.difficulty}, topic: ${problem.topic}). Just point toward the right approach in 2-3 sentences. Do NOT give the solution.`,
      2: `Give a medium hint for "${problem.title}" (${problem.difficulty}, topic: ${problem.topic}). Mention the data structure or algorithm to use and why. Still do NOT give code.`,
      3: `Give a detailed hint for "${problem.title}" (${problem.difficulty}, topic: ${problem.topic}). Explain the step-by-step approach and time/space complexity. No actual code.`,
    };

    const prompt = hintPrompts[hintLevel] || hintPrompts[1];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'AI service error' });
    }

    const hint = data.content[0].text;

    res.json({ hint, hintLevel, problem: problem.title });
  } catch (err) {
    next(err);
  }
};

const getInterviewQuestion = async (req, res, next) => {
  try {
    const { problemId } = req.body;

    const result = await db.query(
      `SELECT title, difficulty, topic FROM problems WHERE id = $1`,
      [problemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problem = result.rows[0];

    const prompt = `You are a technical interviewer at a top tech company. The candidate is solving "${problem.title}" (${problem.difficulty} - ${problem.topic}). Ask them ONE clarifying question that a real interviewer would ask at the start, like edge cases, constraints, or expected input/output format. Keep it short and natural.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const question = data.content[0].text;

    res.json({ question, problem: problem.title });
  } catch (err) {
    next(err);
  }
};

const reviewSolution = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({ error: 'Problem ID and code are required' });
    }

    const result = await db.query(
      `SELECT title, difficulty, topic FROM problems WHERE id = $1`,
      [problemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problem = result.rows[0];

    const prompt = `Review this ${language || 'code'} solution for the LeetCode problem "${problem.title}" (${problem.difficulty}):

\`\`\`${language || ''}
${code}
\`\`\`

Give feedback on:
1. Time complexity
2. Space complexity  
3. One thing done well
4. One improvement suggestion

Keep it concise, under 200 words.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const review = data.content[0].text;

    res.json({ review, problem: problem.title });
  } catch (err) {
    next(err);
  }
};

module.exports = { getHint, getInterviewQuestion, reviewSolution };