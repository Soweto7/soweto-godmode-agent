require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aiService = require('./aiService');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  const { message, provider } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const reply = await aiService.getAIReply(message, provider);
    res.json({ reply });
  } catch (error) {
    console.error('Error getting AI reply:', error);
    res.status(500).json({ error: 'Failed to get AI reply' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
