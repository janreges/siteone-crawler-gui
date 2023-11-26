import { ElectronAPI } from '@electron-toolkit/preload'
import { CrawlerMessage } from '../main/crawler/CrawlerMessage';

export interface IAPI {
  setMessageToBackend: (message: CrawlerMessage) => void,
  onCrawlerMessage: (callback: (event: any, message: CrawlerMessage) => void) => void,
  getPlatform: () => any
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IAPI
  }
}
