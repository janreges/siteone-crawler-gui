export enum CrawlerMessageType {
  START = "START",
  STARTING = "STARTING",
  STARTED = "STARTED",
  STOP = "STOP",
  STOPPING = "STOPPING",
  STOPPED = "STOPPED",
  WEBSOCKET_MESSAGE = "WEBSOCKET_MESSAGE",
  STDOUT_DATA = "STDOUT_DATA",
  STDERR_DATA = "STDERR_DATA",
  RESULT = "RESULT",
  DEBUG = "DEBUG",
  ERROR = "ERROR",
}

export interface CrawlerMessage {
  type: CrawlerMessageType;
  data: any;
}
