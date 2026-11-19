const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let serverProcess = null;
const PORT = 3050;

function getAppDataDir() {
  const dir = path.join(app.getPath('userData'), 'database');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function waitForServer(url, timeoutMs = 30000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error('Timeout waiting for Next.js server'));
      } else {
        setTimeout(check, 500);
      }
    };

    check();
  });
}

function startNextServer() {
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  if (isDev) {
    return Promise.resolve(); // Next.js is run via concurrently in npm run electron:dev
  }

  return new Promise((resolve, reject) => {
    const appPath = app.getAppPath();
    const serverScript = path.join(appPath, 'node_modules', 'next', 'dist', 'bin', 'next');

    // In packaged app, use bundled node.exe in resourcesPath; in dev, use local or system node
    let nodeExecutable = 'node';
    if (app.isPackaged) {
      const resourceNode = path.join(process.resourcesPath, 'node.exe');
      const appNode = path.join(appPath, 'node.exe');
      if (fs.existsSync(resourceNode)) {
        nodeExecutable = resourceNode;
      } else if (fs.existsSync(appNode)) {
        nodeExecutable = appNode;
      } else {
        nodeExecutable = process.platform === 'win32' ? 'node.exe' : 'node';
      }
    } else {
      const localNode = path.join(appPath, 'node.exe');
      if (fs.existsSync(localNode)) {
        nodeExecutable = localNode;
      } else {
        nodeExecutable = process.platform === 'win32' ? 'node.exe' : 'node';
      }
    }

    const env = Object.assign({}, process.env, {
      PORT: String(PORT),
      DB_PATH: path.join(getAppDataDir(), 'paint_store.db'),
      NODE_ENV: 'production',
    });

    serverProcess = spawn(nodeExecutable, [serverScript, 'start', '-p', String(PORT)], {
      cwd: appPath,
      env,
      stdio: 'inherit',
    });

    waitForServer(`http://localhost:${PORT}`)
      .then(resolve)
      .catch(reject);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    title: 'Paint Billing ERP & POS',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const url = `http://localhost:${PORT}`;
  mainWindow.loadURL(url);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Ensure database directory
  process.env.DB_PATH = path.join(getAppDataDir(), 'paint_store.db');

  try {
    await startNextServer();
    createWindow();
  } catch (err) {
    console.error('Failed to start application:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
