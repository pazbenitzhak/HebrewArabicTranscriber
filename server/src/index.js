const express = require('express');
const cors = require('cors');
const { transcribe } = require('./transcribe');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/transcribe', (req, res) => {
  const { text } = req.body;

  if (text === undefined || text === null) {
    return res.status(400).json({ error: 'Missing "text" field in request body.' });
  }

  const result = transcribe(text);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ result: result.result });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
