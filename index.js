require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sequelize = require('./database');

const User = require('./models/User');
const StudyPlan = require('./models/StudyPlan');
const WellnessLog = require('./models/WellnessLog');
const LearningGap = require('./models/LearningGap');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized: Access token is missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    req.user = user;
    next();
  });
};

/* 
// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
  console.warn('⚠️ WARNING: Gemini API Key is missing or invalid in .env file. AI features will not work.');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'dummy_key'); // Prevent crash on init, fail on call
*/

// Database Synchronization
sequelize.sync().then(() => {
  console.log('Database synced');
}).catch((err) => {
  console.error('Failed to sync database:', err);
});

// Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, username: user.username, email: user.email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Study Plan Routes
app.post('/api/plan', authenticateToken, async (req, res) => {
  try {
    const { schedule, examDate, goals } = req.body;
    
    // Check if plan exists
    let plan = await StudyPlan.findOne({ where: { userId: req.user.userId } });
    
    if (plan) {
      plan.schedule = JSON.stringify(schedule);
      plan.examDate = examDate;
      plan.goals = goals;
      await plan.save();
    } else {
      plan = await StudyPlan.create({
        userId: req.user.userId,
        schedule: JSON.stringify(schedule),
        examDate,
        goals
      });
    }
    
    res.json({ message: 'Plan saved successfully', plan });
  } catch (error) {
    console.error('Save plan error:', error);
    res.status(500).json({ message: 'Error saving plan' });
  }
});

app.get('/api/plan', authenticateToken, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ where: { userId: req.user.userId } });
    if (!plan) {
      return res.json({ schedule: [], examDate: '', goals: '' });
    }
    res.json({
      schedule: JSON.parse(plan.schedule),
      examDate: plan.examDate,
      goals: plan.goals
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ message: 'Error fetching plan' });
  }
});

// Wellness Log Routes
app.post('/api/wellness', authenticateToken, async (req, res) => {
  try {
    const { mood, stress, sleepHours, sleepQuality, notes } = req.body;
    
    const log = await WellnessLog.create({
      userId: req.user.userId,
      mood,
      stress,
      sleepHours,
      sleepQuality,
      notes
    });
    
    res.json({ message: 'Wellness log saved', log });
  } catch (error) {
    console.error('Wellness log error:', error);
    res.status(500).json({ message: 'Error saving wellness log' });
  }
});

// Learning Gap Routes
app.get('/api/gaps', authenticateToken, async (req, res) => {
  try {
    const gaps = await LearningGap.findAll({ where: { userId: req.user.userId } });
    res.json(gaps);
  } catch (error) {
    console.error('Get gaps error:', error);
    res.status(500).json({ message: 'Error fetching learning gaps' });
  }
});

app.post('/api/gaps', authenticateToken, async (req, res) => {
  try {
    const { concept, subject, confidence, status, revisionTopic, activity } = req.body;
    const gap = await LearningGap.create({
      userId: req.user.userId,
      concept,
      subject,
      confidence,
      status,
      revisionTopic,
      activity
    });
    res.json(gap);
  } catch (error) {
    console.error('Save gap error:', error);
    res.status(500).json({ message: 'Error saving learning gap' });
  }
});

app.delete('/api/gaps/:id', authenticateToken, async (req, res) => {
  try {
    await LearningGap.destroy({ where: { id: req.params.id, userId: req.user.userId } });
    res.json({ message: 'Gap deleted successfully' });
  } catch (error) {
    console.error('Delete gap error:', error);
    res.status(500).json({ message: 'Error deleting learning gap' });
  }
});

// Dashboard Stats Route
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    // Calculate simple stats based on logs and plans
    
    const logs = await WellnessLog.findAll({ 
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']]
    });
    const plan = await StudyPlan.findOne({ where: { userId: req.user.userId } });
    
    const studyHours = plan ? JSON.parse(plan.schedule).reduce((acc, day) => {
        return acc + day.tasks.filter(t => t.type === 'study' || t.type === 'revision').length;
    }, 0) : 0; // Rough estimate: 1 task = 1 hour

    const avgMood = logs.length > 0 ? logs.reduce((acc, log) => acc + log.mood, 0) / logs.length : 0;
    
    const lastCheckIn = logs.length > 0 ? logs[0] : null;

    res.json({
      studyHours: `${studyHours}h`,
      conceptsSolved: '12', // Placeholder
      avgEvaluation: '8.5', // Placeholder
      studyStreak: `${logs.length}d`,
      lastCheckIn
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Helper: sanitize code fences (close unclosed triple backticks)
function sanitizeCodeBlocks(text) {
  if (typeof text !== 'string') return text;
  const matches = text.match(/```/g) || [];
  if (matches.length % 2 !== 0) return text + '\n```';
  return text;
}

// Helper: build a clear prompt from either a simple prompt or structured intent
function buildPromptFromBody(body) {
  const SYSTEM_INSTRUCTION = `You are AI Study Doctor.\nYour purpose is to help students academically and emotionally.\nYou must strictly follow the role defined by the MODULE.\nNever mix roles.\nNever give medical or clinical advice.\nYour tone must always be student-friendly, calm, and motivating.`;

  if (!body) return SYSTEM_INSTRUCTION + '\n\n(Empty prompt received)';

  if (typeof body.prompt === 'string') {
    return SYSTEM_INSTRUCTION + '\n\n' + sanitizeCodeBlocks(body.prompt);
  }

  const intent = body.intent || {};
  const module = (intent.module || intent.type || 'generic').toLowerCase();
  let userText = intent.input || intent.message || intent.intent || '';
  userText = sanitizeCodeBlocks(String(userText));

  // Add safety note for code-related inputs
  let codeNote = '';
  if (/\[python\]|```python|\bpython\b/i.test(userText)) {
    codeNote = '\n\n[Note: The user included Python code. Do NOT execute code. Provide code in a fenced ```python``` block and a short explanation. If code looks malformed, try to fix minor syntax issues but do not invent behavior.]';
  }

  let modulePrompt = '';
  switch (module) {
    case 'wellness':
      modulePrompt = `You are an empathetic wellness mentor. Keep responses supportive, non-clinical, and focused on study-related wellbeing. Reply briefly and include one actionable tip.\nStudent message:\n"${userText}"`;
      break;
    case 'tutor':
      modulePrompt = `You are a tutor. Explain the student's doubt in very simple words, provide one short example, and avoid advanced jargon.\nTopic/subject: ${intent.subject || 'General'}\nStudent doubt:\n"${userText}"`;
      break;
    case 'examiner':
      modulePrompt = `You are an examiner. Generate one concise mock question and a short explanation/answer. Topic:\n"${userText}"`;
      break;
    case 'studyplanner':
    case 'study-plan':
      modulePrompt = `You are a study planner. Suggest a short, pragmatic study plan tailored to the student's exam date or constraints. Context:\n"${userText}"`;
      break;
    default:
      modulePrompt = `User input:\n"${userText}"`;
  }

  return SYSTEM_INSTRUCTION + '\n\n' + modulePrompt + codeNote;
}

// Internal function to call Gemini with fallback handling
async function callGeminiWithFallback(apiKey, finalPrompt) {
  const genAI = new GoogleGenerativeAI(apiKey);

  // Try flash first, then pro as fallback
  const tryModel = async (modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: undefined });
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    return response.text();
  };

  try {
    return await tryModel('gemini-1.5-flash');
  } catch (errFlash) {
    console.warn('Flash model failed, trying pro:', errFlash && errFlash.message);
    try {
      return await tryModel('gemini-1.5-pro');
    } catch (errPro) {
      console.error('Both Gemini models failed:', errPro && errPro.message);
      throw errPro || errFlash;
    }
  }
}

// Gemini API Route (accepts plain prompt or structured intent)
app.post('/api/gemini', authenticateToken, async (req, res) => {
  try {
    const body = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    const finalPrompt = buildPromptFromBody(body);

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn('Gemini API Key is missing; returning helpful fallback text');
      // Return helpful fallback text (200) so UI can show useful guidance instead of static error
      return res.json({ text: `AI features are temporarily unavailable. Meanwhile, here's a short helpful response based on your input:\n\n${finalPrompt.split('\n').slice(-6).join('\n')}` });
    }

    try {
      const text = await callGeminiWithFallback(apiKey, finalPrompt);
      return res.json({ text });
    } catch (aiError) {
      console.error('Gemini provider error:', aiError && aiError.message);
      // Provide user-friendly fallback text
      return res.json({ text: 'Sorry, the AI provider is currently unavailable. Please try again in a few moments.' });
    }
  } catch (error) {
    console.error('Gemini API processing error:', error);
    return res.status(500).json({ message: 'Error processing request with Gemini' });
  }
});

// Wellness chat route: logs a lightweight record and returns AI response (reuses Gemini logic)
app.post('/api/wellness/chat', authenticateToken, async (req, res) => {
  try {
    const { message, intent } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const bodyIntent = intent || { module: 'wellness', input: message };
    const finalPrompt = buildPromptFromBody({ intent: bodyIntent });

    let aiText = '';
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      aiText = `AI support is temporarily unavailable. Here's a gentle tip: Take a short 5-min walk and try a breathing exercise.`;
    } else {
      try {
        aiText = await callGeminiWithFallback(apiKey, finalPrompt);
      } catch (err) {
        console.error('Gemini error in wellness chat:', err && err.message);
        aiText = 'Sorry, I could not reach the AI right now. Please try again later.';
      }
    }

    // Log the interaction to WellnessLog notes for visibility
    try {
      await WellnessLog.create({
        userId: req.user.userId,
        mood: 0,
        stress: 0,
        sleepHours: 0,
        sleepQuality: null,
        notes: `User: ${message}\nAI: ${aiText}`
      });
    } catch (logErr) {
      console.warn('Failed to log wellness chat:', logErr && logErr.message);
    }

    return res.json({ text: aiText });
  } catch (error) {
    console.error('Wellness chat error:', error);
    return res.status(500).json({ message: 'Error processing wellness chat' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
