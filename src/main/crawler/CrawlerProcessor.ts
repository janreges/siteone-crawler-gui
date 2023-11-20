import { ChildProcess, spawn } from 'child_process';
import WebSocket, { ErrorEvent, CloseEvent, MessageEvent } from 'ws';
import { BrowserWindow } from 'electron';
import { CrawlerMessageType } from './CrawlerMessage';
import { app } from 'electron';
import crawlerFormContent from '../../renderer/src/types/CrawlerFormContent';

const path = require('path');
const fs = require('fs');

class CrawlerProcessor {
  public isRunning: boolean;
  public progress: number;

  private mainWindow: BrowserWindow;
  private crawlerProcess: ChildProcess | null;
  private websocket: WebSocket | null;
  private websocketHostAndPort: string | null = null;

  private static RECONNECT_TIMEOUT = 1000;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.crawlerProcess = null;
    this.isRunning = false;
    this.progress = 0;
    this.websocket = null;

    const debugObj = {
      dirNam: __dirname,
      exe: app.getPath('exe'),
      resources: app.getPath('appData'),
      userData: app.getPath('userData'),
      temp: app.getPath('temp'),
      home: app.getPath('home'),
      desktop: app.getPath('desktop'),
      documents: app.getPath('documents'),
      downloads: app.getPath('downloads'),
      music: app.getPath('music'),
      pictures: app.getPath('pictures'),
      videos: app.getPath('videos')
    };

    console.log(debugObj);

    this.sendMessageToRenderer(CrawlerMessageType.DEBUG, debugObj);
  }

  public startCrawler(request: crawlerFormContent): void {

    if (request['websocketServer']) {
      this.websocketHostAndPort = request['websocketServer'];
    } else {
      this.websocketHostAndPort = '127.0.0.1:8233';
    }

    this.sendMessageToRenderer(CrawlerMessageType.STARTING, request);

    if (this.isRunning) {
      this.sendMessageToRenderer(CrawlerMessageType.ERROR, {
        message: 'Crawler is already running.'
      });
      console.log('Crawler is already running.');
      return;
    }

    console.log('startCrawler: ' + request);

    let swoolePath;
    let crawlerPhpPath;

    const isProduction = process.env.NODE_ENV !== 'development';

    if (isProduction) {
      swoolePath = path.join(process.resourcesPath, 'bin', 'swoole-cli'.concat(process.platform === 'win32' ? '.exe' : ''));
      crawlerPhpPath = path.join(process.resourcesPath, 'src', 'crawler.php');
    } else {
      swoolePath = path.join(__dirname, '..', '..', 'dev', 'bin', 'swoole-cli'.concat(process.platform === 'win32' ? '.exe' : ''));
      crawlerPhpPath = path.join(__dirname, '..', '..', 'dev', 'src', 'crawler.php');
    }

    if (!fs.existsSync(swoolePath)) {
      console.error('Swoole CLI nebyl nalezen na očekávané cestě: ', swoolePath);
      // Zde můžete přidat další kroky pro řešení této situace
    }

    const cliParams: string[] = [crawlerPhpPath];
    request['cliParams'].forEach((param: string) => {
      cliParams.push(param);
    });

    if (!request['websocketServer']) {
      cliParams.push('--websocket-server=' + this.websocketHostAndPort);
    }

    this.crawlerProcess = spawn(swoolePath, cliParams);

    if (this.crawlerProcess === null) {
      console.error('Unable to start crawler');
      this.stopCrawler();
      return;
    } else if (this.crawlerProcess.stdout) {
      this.crawlerProcess.stdout.on('data', (data: Buffer) => {
        console.log(`Crawler: ${data.toString()}`);
      });
    }

    this.isRunning = true;
    this.connectWebSocket();
  }

  public stopCrawler(): void {
    this.sendMessageToRenderer(CrawlerMessageType.STOPPING, {});

    if (this.crawlerProcess && !this.crawlerProcess.killed) {
      this.crawlerProcess.kill();
    }
    this.isRunning = false;
    this.progress = 0;
    if (this.websocket) {
      this.websocket.close();
    }

    this.sendMessageToRenderer(CrawlerMessageType.STOPPED, {});
  }

  private connectWebSocket(): void {
    this.sendMessageToRenderer(CrawlerMessageType.DEBUG, { message: 'Connecting to WebSocket...' });
    const connect = (): void => {
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }
      this.websocket = new WebSocket('ws://' + this.websocketHostAndPort);

      this.websocket.on('open', () => {
        this.sendMessageToRenderer(CrawlerMessageType.DEBUG, {
          message: 'WebSocket connection opened.'
        });
        console.log('WebSocket connection opened.');
      });

      this.websocket.on('message', (event: MessageEvent) => {
        const data = JSON.parse(event.data.toString());
        //this.progress = data.progress;
        this.sendMessageToRenderer(CrawlerMessageType.WEBSOCKET_MESSAGE, data);
      });

      this.websocket.on('close', (event: CloseEvent) => {
        this.sendMessageToRenderer(CrawlerMessageType.DEBUG, {
          message: 'WebSocket connection closed.',
          code: event.code
        });
        // console.log('WebSocket connection closed. Attempt to reconnect in 1 second.');
        // setTimeout(connect, 1000);
      });

      this.websocket.on('error', (event: ErrorEvent) => {
        this.sendMessageToRenderer(CrawlerMessageType.DEBUG, {
          message: 'WebSocket error.',
          error: event.message
        });
        console.error('WebSocket Error:', event.message);
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
          console.log('Attempt to reconnect in ' + CrawlerProcessor.RECONNECT_TIMEOUT + '  ms.');
          setTimeout(connect, 1000);
        }
      });
    };

    connect();
  }

  private sendMessageToRenderer(type: CrawlerMessageType, data: object): void {
    this.mainWindow.webContents.send('crawler-message', { type, data });
  }
}

export default CrawlerProcessor;
