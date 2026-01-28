Bet bro, I got you. Here’s a **clean, professional README** you can drop straight into your project — explains everything clearly, including how it works and how to build it.

---

# WireGuard VPN Client

**WireGuard VPN Client** is a desktop application built with **Electron** and **Node.js** that lets you monitor and manage your VPN connection in real-time. It shows your public IP, geolocation, network interfaces, and live traffic logs — all in a clean, interactive interface.

---

## Features

* **Login Authentication:** Simple fixed demo credentials for access.
* **Public IP & Geo-location:** Displays your IP, city, country, and ISP on an interactive map.
* **Network Interfaces:** Lists all active network adapters with IP addresses, MACs, and status.
* **Live Traffic Monitoring:** Real-time network packet monitoring via `tcpdump` streamed to the UI.
* **VPN Status Indicator:** Visual Connect / Disconnect status based on IP detection.
* **Cross-platform:** Works on Linux and Windows (requires proper packaging).

---

## Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd geo-ip-demo
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the app in development**

```bash
npm start
```

4. **Start backend manually (optional)**

```bash
npm run server
```

---

## Usage

1. Open the app via Electron (`npm start`)
2. Login using demo credentials:

   * Username: `munyaradzi`
   * Password: `admin`
3. View your **IP & geolocation**, **network interfaces**, and **live traffic logs** in the respective tabs.
4. The **Connect/Disconnect button** indicates VPN status based on your IP.

---

## How It Works

1. **Frontend (Electron Renderer)**

   * Loaded from `public/login.html` and `public/home.html`.
   * Fetches data from the local backend using `fetch()` (e.g., `/getGeo/:ip`, `/interfaces`).
   * Connects to WebSocket (`ws://127.0.0.1:3002`) to receive live tcpdump logs.

2. **Backend (Node.js / Express)**

   * Serves static frontend files.
   * Provides APIs for IP geolocation and network interfaces.
   * Spawns a single **tcpdump process** to stream network traffic to all connected WebSocket clients.

3. **Electron Main Process**

   * Launches the Node.js backend automatically on app startup.
   * Creates a `BrowserWindow` for the frontend UI.
   * Kills backend when app closes.

---

## Build for Production

1. **Install electron-builder**

```bash
npm install --save-dev electron-builder
```

2. **Build the app**

```bash
npm run build
```

* Linux → `.AppImage` and `.deb` in `dist/`
* Windows → `.exe` installer in `dist/` (requires Wine if building on Linux)

---

## Notes

* **tcpdump requires sudo privileges** on Linux. You may need to run `sudo setcap cap_net_raw,cap_net_admin=eip $(which node)` for permission-less capture.
* **CORS is enabled** in the backend to allow frontend fetches.
* IP geolocation uses [ip-api.com](http://ip-api.com/).

---

## Contact

**Author:** Munyaradzi Chirove
📧 [chirovemunyaradzi@gmail.com](mailto:chirovemunyaradzi@gmail.com)
📞 +263 78 610 3016

---

## License

MIT License (or ISC, depending on your preference)

---