const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

// Path to server.js (works in dev and packaged app)
const serverPath = app.isPackaged 
  ? path.join(process.resourcesPath, "app.asar.unpacked", "server.js") 
  : path.join(__dirname, "server.js");

let backend;

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
  });

  win.loadFile(path.join(__dirname, "public/login.html"));

  win.on("closed", () => {
    if (backend) backend.kill();
    backend = null;
  });
}

app.whenReady().then(() => {
  try {
    backend = spawn("node", [serverPath], {
      cwd: app.isPackaged ? path.join(process.resourcesPath, "app.asar.unpacked") : __dirname,
      stdio: "inherit",
    });
  } catch (err) {
    console.error("Failed to start backend:", err);
  }

  createWindow();
});

app.on("window-all-closed", () => {
  if (backend) backend.kill();
  app.quit();
});
