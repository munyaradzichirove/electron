// server.js
const express = require('express');
const os = require('os');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const app = express();
const HTTP_PORT = 3001;
const WS_PORT = 3002;

// Serve static frontend
app.use(express.static('public'));

// --- IP Geolocation ---
app.get('/getGeo/:ip', async (req, res) => {
  const ip = req.params.ip;
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    if (data.status !== 'success') {
      return res.status(400).json({ error: 'API failed', message: data.message });
    }

    res.json({
      lat: data.lat,
      lon: data.lon,
      city: data.city,
      country: data.country,
      isp: data.isp,
      query: data.query
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Network Interfaces ---
app.get('/interfaces', (req, res) => {
  const interfaces = os.networkInterfaces();
  res.json(interfaces);
});

// --- Start HTTP server ---
app.listen(HTTP_PORT, () => console.log(`HTTP server running on http://localhost:${HTTP_PORT}`));

// --- WebSocket TCPDump Streaming ---
const wss = new WebSocket.Server({ port: WS_PORT });
const clients = new Set();

// Spawn a single tcpdump process for all clients
const tcpdump = spawn('sudo', ['tcpdump', '-i', 'wlo1', '-l', '-U']); // -l = line buffered, -U = unbuffered

tcpdump.stdout.on('data', (data) => {
  const message = data.toString();
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
});

tcpdump.stderr.on('data', (data) => {
  console.error('tcpdump stderr:', data.toString());
});

tcpdump.on('close', (code) => {
  console.log('tcpdump exited with code', code);
});

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});
