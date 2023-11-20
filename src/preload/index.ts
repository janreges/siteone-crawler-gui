import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { CrawlerMessage } from '../main/crawler/CrawlerMessage';

// Custom APIs for renderer
const api = {
  setMessageToBackend: (message: CrawlerMessage) => ipcRenderer.send('crawler-message', message),
  onCrawlerMessage: (callback: (event: any, message: CrawlerMessage) => void) => ipcRenderer.on('crawler-message', callback),
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
