// Import dependencies
const vision = require('@google-cloud/vision');

// Setup Vision API client
const visionClient = new vision.ImageAnnotatorClient({
  // By default, this reads GOOGLE_APPLICATION_CREDENTIALS env variable 
  // with your credential JSON file path
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Moved up


const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.PPLX_API_KEY,
  baseURL: "https://api.perplexity.ai",
});


// Create an Express app
const app = express();

// Middleware to enable CORS (so your React app can talk to this backend)
app.use(cors());
// Middleware to parse incoming JSON data
app.use(express.json());

// Multer setup
const upload = multer({ dest: 'uploads/' });
//for api calls
async function getAiSummary(text) {
  const response = await openai.chat.completions.create({
    model: "sonar-pro", // or "sonar"
    messages: [
      { role: "system", content: "You are a medical assistant. Given the following text, summarize it and list possible uses, pros, and cons of any medicine mentioned. Respond as a helpful assistant." },
      { role: "user", content: text }
    ],
    max_tokens: 300,
    temperature: 0.6,
  });
  return response.choices[0].message.content;
}




// Basic route for testing
app.get('/', (req, res) => {
  res.send('Medilens backend running');
});

// File upload endpoint (move below multer config)
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Defensive: check for file
    if (!req.file) {
      return res.status(400).json({ error: "No file received." });
    }

    const mimetype = req.file.mimetype || "";
    // Only allow images, return error for others
    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({ error: "Only image files are supported." });
    }

    let extractedText = "";
    let aiInsight = "";

    // OCR for image files (Google Vision)
    const [result] = await visionClient.textDetection(req.file.path);
    extractedText = result.fullTextAnnotation?.text || "";

    // Summarize/extract insights with Perplexity (if OCR'd text exists)
    if (extractedText.trim()) {
      aiInsight = await getAiSummary(extractedText);
    }

    res.json({ aiInsight, extractedText, file: req.file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI analysis failed", details: err.message });
  }
});




// Start the server on port 5001
app.listen(5001, () => {
  console.log('Server started on port 5001');
});
