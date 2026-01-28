const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let backend;

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
  });

  win.loadFile(path.join(__dirname, "public/login.html"));
}

app.whenReady().then(() => {
  backend = spawn("node", ["server.js"], {
    cwd: __dirname,
    stdio: "inherit",
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (backend) backend.kill();
  app.quit();
});
