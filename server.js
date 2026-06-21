const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'logs.json');

app.use(require('cors')());
app.use(express.json());
app.use(express.static(__dirname));

function readLogs() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) || [];
  } catch (err) {
    return [];
  }
}

function writeLogs(logs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2));
}

app.get('/api/logs', (req, res) => {
  return res.json(readLogs());
});

app.post('/api/logs', (req, res) => {
  const entry = req.body;
  if (!entry || typeof entry !== 'object') {
    return res.status(400).json({ error: 'Invalid log entry' });
  }

  entry.id = entry.id || Date.now();
  entry.date = entry.date || new Date().toISOString().split('T')[0];

  const logs = readLogs();
  logs.unshift(entry);
  writeLogs(logs);
  return res.status(201).json(entry);
});

app.delete('/api/logs/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid log ID' });
  }

  const logs = readLogs();
  const filtered = logs.filter((entry) => entry.id !== id);
  if (filtered.length === logs.length) {
    return res.status(404).json({ error: 'Log not found' });
  }

  writeLogs(filtered);
  return res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`HYROX backend running at http://localhost:${PORT}`);
});
