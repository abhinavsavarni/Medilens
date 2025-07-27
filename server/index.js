require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const vision = require('@google-cloud/vision');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const OpenAI = require("openai");

// ========== Mongoose Setup ==========
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => console.log('MongoDB connected!'));
mongoose.connection.on('error', err => console.error('MongoDB connection error:', err));

// ========== App & Middleware ==========
const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
const upload = multer({ dest: 'uploads/' });

const visionClient = new vision.ImageAnnotatorClient();
const openai = new OpenAI({
  apiKey: process.env.PPLX_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

// ========== Google OAuth ==========
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
      });
    }
    done(null, user);
}));

app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.redirect(`http://localhost:3000?token=${token}&name=${encodeURIComponent(req.user.name)}`);
  }
);

// ========== Helper Function ==========
async function getAiSummary(text) {
  const response = await openai.chat.completions.create({
    model: "sonar-pro",
    messages: [
      { role: "system", content: "You are a medical assistant. Given the following text, summarize it and list possible uses, pros, and cons of any medicine mentioned. Respond as a helpful assistant." },
      { role: "user", content: text }
    ],
    max_tokens: 300,
    temperature: 0.6,
  });
  return response.choices[0].message.content;
}

// ========== Routes ==========

app.get('/', (req, res) => {
  res.send('Medilens backend running');
});


app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file received." });
    const mimetype = req.file.mimetype || "";
    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({ error: "Only image files are supported." });
    }
    let extractedText = "";
    let aiInsight = "";
    const [result] = await visionClient.textDetection(req.file.path);
    extractedText = result.fullTextAnnotation?.text || "";
    if (extractedText.trim()) {
      aiInsight = await getAiSummary(extractedText);
    }
    res.json({ aiInsight, extractedText, file: req.file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI analysis failed", details: err.message });
  }
});

app.post('/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Please provide a valid question." });
    }
    const response = await openai.chat.completions.create({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content:
            "You are Medilens, a helpful but concise AI medical assistant. Answer health and medicine queries briefly—never more than 2 or 3 sentences. Do not repeat yourself. If a user asks something outside your scope, politely advise them to consult a healthcare professional."
        },
        { role: "user", content: question }
      ],
      max_tokens: 130,
      temperature: 0.5,
    });
    const cleanText = response.choices[0].message.content.replace(/\[\d+\]/g, '');
    res.json({ reply: cleanText.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI chat failed", details: err.message });
  }
});

app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "All fields required." });
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ email, password: hash, name });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: "Email already exists." });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.password) return res.status(401).json({ error: "Invalid email or password." });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid email or password." });
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, name: user.name, email: user.email });
});

app.listen(5001, () => {
  console.log('Server started on port 5001');
});
