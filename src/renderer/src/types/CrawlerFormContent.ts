class CrawlerFormContent {

  // Basic settings
  url?: string = null;
  device?: 'desktop' | 'tablet' | 'mobile' = null;
  userAgent?: string = null;
  timeout?: number = null;
  proxy?: string = null;
  httpAuth?: string = null;
  help?: boolean = null;
  version?: boolean = null;

  // Output settings
  output?: 'text' | 'json' = null;
  extraColumns?: string = null;
  urlColumnSize?: number = null;
  showInlineCriticals?: boolean = null;
  showInlineWarnings?: boolean = null;
  doNotTruncateUrl?: boolean = null;
  showSchemeAndHost?: boolean = null;
  hideProgressBar?: boolean = null;
  noColor?: boolean = null;

  // Resource filtering
  disableJavascript?: boolean = null;
  disableStyles?: boolean = null;
  disableFonts?: boolean = null;
  disableImages?: boolean = null;
  disableFiles?: boolean = null;
  removeAllAnchorListeners?: boolean = null;

  // Advanced crawler settings
  workers?: number = null;
  maxReqsPerSec?: string = null;
  memoryLimit?: string = null;
  allowedDomainForExternalFiles?: string = null;
  allowedDomainForCrawling?: string = null;
  includeRegex?: string = null;
  ignoreRegex?: string = null;
  analyzerFilterRegex?: string = null;
  acceptEncoding?: string = null;
  removeQueryParams?: boolean = null;
  addRandomQueryParams?: boolean = null;
  maxQueueLength?: number = null;
  maxVisitedUrls?: number = null;
  maxUrlLength?: number = null;

  // Expert settings
  debug?: boolean = null;
  debugLogFile?: string = null;
  debugUrlRegex?: string = null;
  resultStorage?: 'memory' | 'file' = null;
  resultStorageDir?: string = null;
  resultStorageCompression?: boolean = null;
  httpCacheDir?: string = null;
  httpCacheCompression?: boolean = null;
  websocketServer?: string = null;

  // File export settings
  outputHtmlReport?: string = null;
  outputJsonFile?: string = null;
  outputTextFile?: string = null;
  addHostToOutputFile?: boolean = null;
  addTimestampToOutputFile?: boolean = null;

  // Mailer options
  mailTo?: string = null;
  mailFrom?: string = null;
  mailFromName?: string = null;
  mailSubjectTemplate?: string = null;
  mailSmtpHost?: string = null;
  mailSmtpPort?: number = null;
  mailSmtpUser?: string = null;
  mailSmtpPass?: string = null;

  // Offline exporter options
  offlineExportDirectory?: string = null;
  offlineExportStoreOnlyUrlRegex?: string = null;

  // Sitemap options
  sitemapXmlFile?: string = null;
  sitemapTxtFile?: string = null;
  sitemapBasePriority?: string = null;
  sitemapPriorityIncrease?: string = null;

  // Fastest URL analyzer
  fastestUrlsTopLimit?: number = null;
  fastestUrlsMaxTime?: string = null;

  // SEO and OpenGraph analyzer
  maxHeadingLevel?: number = null;

  // Slowest URL analyzer
  slowestUrlsTopLimit?: number = null;
  slowestUrlsMinTime?: string = null;
  slowestUrlsMaxTime?: string = null;

  // URL params
  cliParams: string[] = [];

  constructor(init?: Partial<CrawlerFormContent>) {
    Object.assign(this, init);
  }

  generateCliParams(): string[] {
    const params = [];

    // Basic settings
    if (this.url !== null) params.push(`--url=${this.url}`);
    if (this.device !== null) params.push(`--device=${this.device}`);
    if (this.userAgent !== null) params.push(`--user-agent=${this.userAgent}`);
    if (this.timeout !== null) params.push(`--timeout=${this.timeout}`);
    if (this.proxy !== null) params.push(`--proxy=${this.proxy}`);
    if (this.httpAuth !== null) params.push(`--http-auth=${this.httpAuth}`);
    if (this.help) params.push(`--help`);
    if (this.version) params.push(`--version`);

    // Output settings
    if (this.output !== null) params.push(`--output=${this.output}`);
    if (this.extraColumns !== null) params.push(`--extra-columns=${this.extraColumns}`);
    if (this.urlColumnSize !== null) params.push(`--url-column-size=${this.urlColumnSize}`);
    if (this.showInlineCriticals) params.push(`--show-inline-criticals`);
    if (this.showInlineWarnings) params.push(`--show-inline-warnings`);
    if (this.doNotTruncateUrl) params.push(`--do-not-truncate-url`);
    if (this.showSchemeAndHost) params.push(`--show-scheme-and-host`);
    if (this.hideProgressBar) params.push(`--hide-progress-bar`);
    if (this.noColor) params.push(`--no-color`);

    // Resource filtering
    if (this.disableJavascript) params.push(`--disable-javascript`);
    if (this.disableStyles) params.push(`--disable-styles`);
    if (this.disableFonts) params.push(`--disable-fonts`);
    if (this.disableImages) params.push(`--disable-images`);
    if (this.disableFiles) params.push(`--disable-files`);
    if (this.removeAllAnchorListeners) params.push(`--remove-all-anchor-listeners`);

    // Advanced crawler settings
    if (this.workers !== null) params.push(`--workers=${this.workers}`);
    if (this.maxReqsPerSec !== null) params.push(`--max-reqs-per-sec=${this.maxReqsPerSec}`);
    if (this.memoryLimit !== null) params.push(`--memory-limit=${this.memoryLimit}`);
    if (this.allowedDomainForExternalFiles !== null) params.push(`--allowed-domain-for-external-files=${this.allowedDomainForExternalFiles}`);
    if (this.allowedDomainForCrawling !== null) params.push(`--allowed-domain-for-crawling=${this.allowedDomainForCrawling}`);
    if (this.includeRegex !== null) params.push(`--include-regex=${this.includeRegex}`);
    if (this.ignoreRegex !== null) params.push(`--ignore-regex=${this.ignoreRegex}`);
    if (this.analyzerFilterRegex !== null) params.push(`--analyzer-filter-regex=${this.analyzerFilterRegex}`);
    if (this.acceptEncoding !== null) params.push(`--accept-encoding=${this.acceptEncoding}`);
    if (this.removeQueryParams) params.push(`--remove-query-params`);
    if (this.addRandomQueryParams) params.push(`--add-random-query-params`);
    if (this.maxQueueLength !== null) params.push(`--max-queue-length=${this.maxQueueLength}`);
    if (this.maxVisitedUrls !== null) params.push(`--max-visited-urls=${this.maxVisitedUrls}`);
    if (this.maxUrlLength !== null) params.push(`--max-url-length=${this.maxUrlLength}`);

    // Expert settings
    if (this.debug) params.push(`--debug`);
    if (this.debugLogFile !== null) params.push(`--debug-log-file=${this.debugLogFile}`);
    if (this.debugUrlRegex !== null) params.push(`--debug-url-regex=${this.debugUrlRegex}`);
    if (this.resultStorage !== null) params.push(`--result-storage=${this.resultStorage}`);
    if (this.resultStorageDir !== null) params.push(`--result-storage-dir=${this.resultStorageDir}`);
    if (this.resultStorageCompression) params.push(`--result-storage-compression`);
    if (this.httpCacheDir !== null) params.push(`--http-cache-dir=${this.httpCacheDir}`);
    if (this.httpCacheCompression) params.push(`--http-cache-compression`);
    if (this.websocketServer !== null) params.push(`--websocket-server=${this.websocketServer}`);

    // File export settings
    if (this.outputHtmlReport !== null) params.push(`--output-html-report=${this.outputHtmlReport}`);
    if (this.outputJsonFile !== null) params.push(`--output-json-file=${this.outputJsonFile}`);
    if (this.outputTextFile !== null) params.push(`--output-text-file=${this.outputTextFile}`);
    if (this.addHostToOutputFile) params.push(`--add-host-to-output-file`);
    if (this.addTimestampToOutputFile) params.push(`--add-timestamp-to-output-file`);

    // Mailer options
    if (this.mailTo !== null) params.push(`--mail-to=${this.mailTo}`);
    if (this.mailFrom !== null) params.push(`--mail-from=${this.mailFrom}`);
    if (this.mailFromName !== null) params.push(`--mail-from-name=${this.mailFromName}`);
    if (this.mailSubjectTemplate !== null) params.push(`--mail-subject-template=${this.mailSubjectTemplate}`);
    if (this.mailSmtpHost !== null) params.push(`--mail-smtp-host=${this.mailSmtpHost}`);
    if (this.mailSmtpPort !== null) params.push(`--mail-smtp-port=${this.mailSmtpPort}`);
    if (this.mailSmtpUser !== null) params.push(`--mail-smtp-user=${this.mailSmtpUser}`);
    if (this.mailSmtpPass !== null) params.push(`--mail-smtp-pass=${this.mailSmtpPass}`);

    // Offline exporter options
    if (this.offlineExportDirectory !== null) params.push(`--offline-export-directory=${this.offlineExportDirectory}`);
    if (this.offlineExportStoreOnlyUrlRegex !== null) params.push(`--offline-export-store-only-url-regex=${this.offlineExportStoreOnlyUrlRegex}`);

    // Sitemap options
    if (this.sitemapXmlFile !== null) params.push(`--sitemap-xml-file=${this.sitemapXmlFile}`);
    if (this.sitemapTxtFile !== null) params.push(`--sitemap-txt-file=${this.sitemapTxtFile}`);
    if (this.sitemapBasePriority !== null) params.push(`--sitemap-base-priority=${this.sitemapBasePriority}`);
    if (this.sitemapPriorityIncrease !== null) params.push(`--sitemap-priority-increase=${this.sitemapPriorityIncrease}`);

    // Fastest URL analyzer
    if (this.fastestUrlsTopLimit !== null) params.push(`--fastest-urls-top-limit=${this.fastestUrlsTopLimit}`);
    if (this.fastestUrlsMaxTime !== null) params.push(`--fastest-urls-max-time=${this.fastestUrlsMaxTime}`);

    // SEO and OpenGraph analyzer
    if (this.maxHeadingLevel !== null) params.push(`--max-heading-level=${this.maxHeadingLevel}`);

    // Slowest URL analyzer
    if (this.slowestUrlsTopLimit !== null) params.push(`--slowest-urls-top-limit=${this.slowestUrlsTopLimit}`);
    if (this.slowestUrlsMinTime !== null) params.push(`--slowest-urls-min-time=${this.slowestUrlsMinTime}`);
    if (this.slowestUrlsMaxTime !== null) params.push(`--slowest-urls-max-time=${this.slowestUrlsMaxTime}`);

    return params;
  }
}

export default CrawlerFormContent;
