// server.js
const express = require('express');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const app = express();
const HTTP_PORT = 3001;
const WS_PORT = 3002;


// simple fixed login
const DEMO_USER = "admin";
const DEMO_PASS = "admin";

// Serve static frontend
// serve static files first
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// serve login page first
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === DEMO_USER && password === DEMO_PASS) {
    // redirect to home
    res.redirect('/home');
  } else {
    // wrong credentials
    res.send('<h2>Login failed. <a href="/">Try again</a></h2>');
  }
});
// then serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));


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

tcpdump.stdout.on('data', (data) => {
  const lines = data.toString().split('\n'); // split chunk into lines
  for (const line of lines) {
    if (!line) continue; // skip empty lines
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(line);
      }
    }
  }
});