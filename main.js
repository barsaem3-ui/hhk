const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_FILE = app.isPackaged 
  ? path.join(path.dirname(process.execPath), 'data.json') 
  : path.join(__dirname, 'data.json');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Try to load from local server first, fallback to local file if server is offline
  mainWindow.loadURL('http://127.0.0.1:3000').catch(() => {
    console.log("Local Express server is not running. Falling back to offline local file mode.");
    mainWindow.loadFile('index.html');
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for data.json
ipcMain.handle('load-data', async () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Load Error:", err.message);
        return [];
    }
});

ipcMain.handle('save-data', async (event, rows) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));
        return { success: true };
    } catch (err) {
        console.error("Save Error:", err.message);
        throw err;
    }
});
