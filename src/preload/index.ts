import {contextBridge, ipcRenderer, shell} from 'electron';
import {electronAPI} from '@electron-toolkit/preload';
import {CrawlerMessage} from '../main/crawler/CrawlerMessage';

const os = require('os');
const path = require('path');

// Custom APIs for renderer
const api = {
  setMessageToBackend: (message: CrawlerMessage) => ipcRenderer.send('crawler-message', message),
  onCrawlerMessage: (callback: (event: any, message: CrawlerMessage) => void) => ipcRenderer.on('crawler-message', callback),
  getPlatform: () => os.platform(),
  getTmpDir: () => getTmpDir(),
  openExternal: (url) => shell.openExternal(url)
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}

async function getTmpDir() {
  const exePath = await ipcRenderer.invoke('get-exe-path');
  const dirPath = path.dirname(exePath);
  return path.join(dirPath, 'resources', 'src', 'siteone-crawler', 'tmp');
}
