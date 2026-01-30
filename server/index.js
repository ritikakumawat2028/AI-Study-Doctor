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

// Gemini API Route
app.post('/api/gemini', authenticateToken, async (req, res) => {
  try {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Gemini API Key is missing');
      return res.status(500).json({ message: 'Server configuration error: Missing API Key' });
    }

    const makeRequest = async (model) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }]
        })
      });
    };

    let response = await makeRequest('gemini-1.5-flash');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error (flash):', response.status, errorText);
      // Fallback to pro if flash is not accessible in the project/region
      if (response.status === 403 || response.status === 404) {
        response = await makeRequest('gemini-1.5-pro');
      } else {
        return res.status(response.status).json({
          message: 'Error from AI Provider',
          details: errorText
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error (pro):', response.status, errorText);
      return res.status(response.status).json({
        message: 'Error from AI Provider',
        details: errorText
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ text });
  } catch (error) {
    console.error('Gemini API processing error:', error);
    res.status(500).json({ message: 'Error processing request with Gemini' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
