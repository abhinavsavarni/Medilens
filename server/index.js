// Import dependencies
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Moved up

// Create an Express app
const app = express();

// Middleware to enable CORS (so your React app can talk to this backend)
app.use(cors());
// Middleware to parse incoming JSON data
app.use(express.json());

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Medilens backend running');
});

// File upload endpoint (move below multer config)
app.post('/upload', upload.single('file'), (req, res) => {
  // You’ll add AI handling here later
  res.json({ file: req.file }); // Returns uploaded file details
});

// Start the server on port 5001
app.listen(5001, () => {
  console.log('Server started on port 5001');
});
