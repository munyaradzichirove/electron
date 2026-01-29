const express = require('express');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const app = express();
const HTTP_PORT = 3001;
const WS_PORT = 3002;

const DEMO_USER = "munyaradzi";
const DEMO_PASS = "admin";

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

 if (username === DEMO_USER && password === DEMO_PASS) {
  res.json({ success: true });
} else {
  res.status(401).json({ success: false, message: "Invalid credentials" });
}
});
app.use(express.static(path.join(__dirname, 'public')));


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

app.get('/interfaces', (req, res) => {
  const interfaces = os.networkInterfaces();
  res.json(interfaces);
});

app.listen(HTTP_PORT, () => console.log(`HTTP server running on http://localhost:${HTTP_PORT}`));

const wss = new WebSocket.Server({ port: WS_PORT });
const clients = new Set();


const tcpdump = spawn('sudo', ['tcpdump', '-i', 'wlo1', '-l', '-U']);
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

app.post('/vpn/up', (req, res) => {
  exec('sudo wg-quick up /etc/wireguard/wg0.conf', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error bringing VPN up: ${error.message}`);
      return res.status(500).json({ success: false, error: error.message });
    }
    if (stderr) {
      console.error(`VPN stderr: ${stderr}`);
    }
    console.log(`VPN stdout: ${stdout}`);
    res.json({ success: true, message: 'VPN is UP' });
  });
});

app.post('/vpn/down', (req, res) => {
  exec('sudo wg-quick down /etc/wireguard/wg0.conf', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error bringing VPN down: ${error.message}`);
      return res.status(500).json({ success: false, error: error.message });
    }
    if (stderr) {
      console.error(`VPN stderr: ${stderr}`);
    }
    console.log(`VPN stdout: ${stdout}`);
    res.json({ success: true, message: 'VPN is DOWN' });
  });
});

tcpdump.stdout.on('data', (data) => {
  const lines = data.toString().split('\n'); 
  for (const line of lines) {
    if (!line) continue; 
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(line);
      }
    }
  }
});