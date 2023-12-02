import { app, shell, ipcMain, BrowserWindow } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import CrawlerProcessor from './crawler/CrawlerProcessor';
import { CrawlerMessage } from './crawler/CrawlerMessage';

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1160,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    ...({ icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: true,
      webSecurity: true
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (details.url.startsWith('file://') && details.url.includes('/SiteOne-Crawler/')) {
      console.log('Allowing file:// ... ' + details.url);
      shell.openExternal(details.url);
      return { action: 'allow' };
    }
    console.log('Denying file:// ... ' + details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  const crawlerProcessor = new CrawlerProcessor(mainWindow);
  ipcMain.on('crawler-message', (event, message: CrawlerMessage) => {
    if (message.type === 'START') {
      console.log('EVENT: received crawler-start' + event);
      crawlerProcessor.startCrawler(message.data);
    } else if (message.type === 'STOP') {
      console.log('EVENT: received crawler-stop');
      crawlerProcessor.stopCrawler();
    }
  });

  ipcMain.handle('get-exe-path', async (event) => {
    console.log('EVENT: received get-exe-path' + event);
    return app.getPath('exe');
  });

  ipcMain.handle('get-tmp-dir', async (event) => {
    return app.getPath('userData');
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
