class CrawlerFormContent {
  private static DEFAULT_UPLOAD_TO: string = 'https://crawler.siteone.io/up';

  // Basic settings
  url: string | null = 'https://';
  singlePage: boolean | null = null;
  maxDepth: number | null = null;
  device: 'desktop' | 'tablet' | 'mobile' | null = null;
  userAgent: string | null = null;
  timeout: number | null = 5;
  proxy: string | null = null;
  httpAuth: string | null = null;
  help: boolean | null = null;
  version: boolean | null = null;
  timezone: string | null = null;

  // Output settings
  output: 'text' | 'json' | null = null;
  extraColumns: string | null = '';
  urlColumnSize: number | null = null;
  showInlineCriticals: boolean | null = null;
  showInlineWarnings: boolean | null = null;
  doNotTruncateUrl: boolean | null = null;
  showSchemeAndHost: boolean | null = null;
  hideProgressBar: boolean | null = null;
  noColor: boolean | null = null;
  forceColor: boolean | null = true;
  htmlReportOptions: string | null = null;

  // Resource filtering
  disableAllAssets: boolean | null = null;
  disableJavascript: boolean | null = null;
  disableStyles: boolean | null = null;
  disableFonts: boolean | null = null;
  disableImages: boolean | null = null;
  disableFiles: boolean | null = null;
  removeAllAnchorListeners: boolean | null = null;
  regexFilteringOnlyForPages: boolean | null = null;

  // Advanced crawler settings
  workers: number | null = 1;
  maxReqsPerSec: number | null = 15;
  memoryLimit: string | null = null;
  allowedDomainForExternalFiles: string[] | null = ['*'];
  allowedDomainForCrawling: string[] | null = [];
  includeRegex: string[] | null = null;
  ignoreRegex: string[] | null = null;
  analyzerFilterRegex: string | null = null;
  acceptEncoding: string | null = null;
  removeQueryParams: boolean | null = null;
  addRandomQueryParams: boolean | null = null;
  maxQueueLength: number | null = null;
  maxVisitedUrls: number | null = 10100;
  maxUrlLength: number | null = null;
  transformUrl: string[] | null = null;
  ignoreRobotsTxt: boolean | null = null;

  // Expert settings
  debug: boolean | null = null;
  debugLogFile: string | null = null;
  debugUrlRegex: string[] | null = null;
  resultStorage: 'memory' | 'file' | null = 'memory';
  resultStorageDir: string | null = 'result-storage';
  resultStorageCompression: boolean | null = null;
  httpCacheDir: string | null = 'http-client-cache';
  httpCacheCompression: boolean | null = null;
  websocketServer: string | null = null;
  consoleWidth: number | null = null;

  // File export settings
  outputHtmlReport: string | null = 'report.%domain%.%datetime%.html';
  outputJsonFile: string | null = 'output.%domain%.%datetime%.json';
  outputTextFile: string | null = 'output.%domain%.%datetime%.txt';
  addHostToOutputFile: boolean | null = null;
  addTimestampToOutputFile: boolean | null = null;

  // Mailer options
  mailTo: string[] | null = null;
  mailFrom: string | null = null;
  mailFromName: string | null = null;
  mailSubjectTemplate: string | null = null;
  mailSmtpHost: string | null = null;
  mailSmtpPort: number | null = null;
  mailSmtpUser: string | null = null;
  mailSmtpPass: string | null = null;

  // Crawling scope
  singleForeignPage: boolean | null = null;
  rowsLimit: number | null = 200;
  maxSkippedUrls: number | null = 10000;
  maxNon200ResponsesPerBasename: number | null = 5;
  resolve: string | null = null;

  // Markdown export options
  markdownExportDir: string | null = null;
  markdownExportStoreOnlyUrlRegex: string[] | null = null;
  markdownDisableImages: boolean | null = null;
  markdownDisableFiles: boolean | null = null;
  markdownExcludeSelector: string | null = null;
  markdownReplaceContent: string | null = null;
  markdownReplaceQueryString: string | null = null;
  markdownIgnoreStoreFileError: boolean | null = null;
  markdownExportSingleFile: string | null = null;
  markdownMoveContentBeforeH1ToEnd: boolean | null = null;
  markdownRemoveLinksAndImagesFromSingleFile: boolean | null = null;

  // Offline exporter options
  offlineExportDir: string | null = null;
  offlineExportStoreOnlyUrlRegex: string[] | null = null;
  offlineExportRemoveUnwantedCode: boolean | null = true;
  offlineExportNoAutoRedirectHtml: boolean | null = null;
  replaceContent: string | null = null;
  replaceQueryString: string | null = null;
  ignoreStoreFileError: boolean | null = null;

  // Sitemap options
  sitemapXmlFile: string | null = null;
  sitemapTxtFile: string | null = null;
  sitemapBasePriority: string | null = null;
  sitemapPriorityIncrease: string | null = null;

  // Fastest URL analyzer
  fastestUrlsTopLimit: number | null = null;
  fastestUrlsMaxTime: string | null = null;

  // SEO and OpenGraph analyzer
  maxHeadingLevel: number | null = null;

  // Slowest URL analyzer
  slowestUrlsTopLimit: number | null = null;
  slowestUrlsMinTime: string | null = null;
  slowestUrlsMaxTime: string | null = null;

  // Upload to server
  upload: boolean = true;
  uploadTo: string = CrawlerFormContent.DEFAULT_UPLOAD_TO;
  uploadRetention: string = '30d';
  uploadPassword: string | null = null;
  uploadTimeout: number = 3600;

  // URL params
  cliParams: string[] = [];

  constructor(init: Partial<CrawlerFormContent>) {
    Object.assign(this, init);
  }

  generateCliParams(tmpDir: string, pathDelimiter: string): string[] {
    const params: string[] = [];

    // make corrections for specific params/cases
    this.makeCorrections();

    // Basic settings
    if (this.url !== null) params.push(`--url=${this.url}`);
    if (this.singlePage) params.push(`--single-page`);
    if (this.maxDepth !== null) params.push(`--max-depth=${this.maxDepth}`);
    if (this.device !== null) params.push(`--device=${this.device}`);
    if (this.userAgent !== null) params.push(`--user-agent='${this.userAgent}'`);
    if (this.timeout !== null) params.push(`--timeout=${this.timeout}`);
    if (this.proxy !== null) params.push(`--proxy='${this.proxy}'`);
    if (this.httpAuth !== null) params.push(`--http-auth='${this.httpAuth}'`);
    if (this.help) params.push(`--help`);
    if (this.version) params.push(`--version`);
    if (this.timezone !== null && this.timezone !== '') params.push(`--timezone='${this.timezone}'`);

    // Output settings
    if (this.output !== null) params.push(`--output=${this.output}`);
    if (this.extraColumns !== null && this.extraColumns.trim() !== '')
      params.push(`--extra-columns='${this.extraColumns}'`);
    if (this.urlColumnSize !== null) params.push(`--url-column-size=${this.urlColumnSize}`);
    if (this.showInlineCriticals) params.push(`--show-inline-criticals`);
    if (this.showInlineWarnings) params.push(`--show-inline-warnings`);
    if (this.doNotTruncateUrl) params.push(`--do-not-truncate-url`);
    if (this.showSchemeAndHost) params.push(`--show-scheme-and-host`);
    if (this.hideProgressBar) params.push(`--hide-progress-bar`);
    if (this.noColor) params.push(`--no-color`);
    if (this.forceColor) params.push(`--force-color`);
    if (this.htmlReportOptions !== null)
      params.push(`--html-report-options='${this.htmlReportOptions}'`);

    // Resource filtering
    if (this.disableAllAssets) params.push(`--disable-all-assets`);
    if (this.disableJavascript) params.push(`--disable-javascript`);
    if (this.disableStyles) params.push(`--disable-styles`);
    if (this.disableFonts) params.push(`--disable-fonts`);
    if (this.disableImages) params.push(`--disable-images`);
    if (this.disableFiles) params.push(`--disable-files`);
    if (this.removeAllAnchorListeners) params.push(`--remove-all-anchor-listeners`);
    if (this.regexFilteringOnlyForPages) params.push(`--regex-filtering-only-for-pages`);

    // Advanced crawler settings
    if (this.workers !== null) params.push(`--workers=${this.workers}`);
    if (this.maxReqsPerSec !== null) params.push(`--max-reqs-per-sec=${this.maxReqsPerSec}`);
    if (this.memoryLimit !== null) params.push(`--memory-limit=${this.memoryLimit}`);
    if (this.allowedDomainForExternalFiles !== null) {
      this.allowedDomainForExternalFiles.forEach((domain) => {
        if (domain !== null && domain.trim() !== '') {
          params.push(`--allowed-domain-for-external-files='${domain}'`);
        }
      });
    }
    if (this.allowedDomainForCrawling !== null) {
      this.allowedDomainForCrawling.forEach((domain) => {
        if (domain !== null && domain.trim() !== '') {
          params.push(`--allowed-domain-for-crawling='${domain}'`);
        }
      });
    }
    if (this.includeRegex !== null) {
      this.includeRegex.forEach((regex) => {
        if (regex !== null && regex.trim() !== '') {
          params.push(`--include-regex='${regex}'`);
        }
      });
    }
    if (this.ignoreRegex !== null) {
      this.ignoreRegex.forEach((regex) => {
        if (regex !== null && regex.trim() !== '') {
          params.push(`--ignore-regex='${regex}'`);
        }
      });
    }
    if (this.analyzerFilterRegex !== null)
      params.push(`--analyzer-filter-regex='${this.analyzerFilterRegex}'`);
    if (this.acceptEncoding !== null) params.push(`--accept-encoding='${this.acceptEncoding}'`);
    if (this.removeQueryParams) params.push(`--remove-query-params`);
    if (this.addRandomQueryParams) params.push(`--add-random-query-params`);
    if (this.maxQueueLength !== null) params.push(`--max-queue-length=${this.maxQueueLength}`);
    if (this.maxVisitedUrls !== null) params.push(`--max-visited-urls=${this.maxVisitedUrls}`);
    if (this.maxUrlLength !== null) params.push(`--max-url-length=${this.maxUrlLength}`);
    if (this.transformUrl !== null) {
      this.transformUrl.forEach((transform) => {
        if (transform !== null && transform.trim() !== '') {
          params.push(`--transform-url='${transform}'`);
        }
      });
    }
    if (this.ignoreRobotsTxt) params.push(`--ignore-robots-txt`);

    // Upload options
    if (this.upload) params.push(`--upload`);
    if (
      this.uploadTo !== null &&
      this.uploadTo !== '' &&
      this.uploadTo !== CrawlerFormContent.DEFAULT_UPLOAD_TO
    )
      params.push(`--upload-to='${this.uploadTo}'`);
    if (this.uploadRetention !== null) params.push(`--upload-retention='${this.uploadRetention}'`);
    if (this.uploadPassword !== null && this.uploadPassword !== '')
      params.push(`--upload-password='${this.uploadPassword}'`);
    if (this.uploadTimeout !== null) params.push(`--upload-timeout=${this.uploadTimeout}`);

    // Expert settings
    if (this.debug) params.push(`--debug`);
    if (this.debugLogFile !== null) params.push(`--debug-log-file='${this.debugLogFile}'`);
    if (this.debugUrlRegex !== null) {
      this.debugUrlRegex.forEach((regex) => {
        if (regex !== null && regex.trim() !== '') {
          params.push(`--debug-url-regex='${regex}'`);
        }
      });
    }
    if (this.resultStorage !== null) params.push(`--result-storage=${this.resultStorage}`);
    if (this.resultStorageDir !== null) {
      let prefix = '';
      if (this.resultStorageDir.substring(0, 1) != '/') {
        prefix = tmpDir + pathDelimiter;
      }
      params.push(`--result-storage-dir='${prefix}${this.resultStorageDir}'`);
    }
    if (this.resultStorageCompression) params.push(`--result-storage-compression`);
    if (this.httpCacheDir !== null && this.httpCacheDir !== '') {
      if (this.httpCacheDir !== 'off') {
        let prefix = '';
        if (this.httpCacheDir.substring(0, 1) != '/') {
          prefix = tmpDir + pathDelimiter;
        }
        params.push(`--http-cache-dir='${prefix}${this.httpCacheDir}'`);
      } else {
        params.push(`--http-cache-dir='off'`);
      }
    }
    if (this.httpCacheCompression) params.push(`--http-cache-compression`);
    if (this.websocketServer !== null) params.push(`--websocket-server='${this.websocketServer}'`);
    if (this.consoleWidth !== null) params.push(`--console-width=${this.consoleWidth}`);

    // File export settings
    if (this.outputHtmlReport !== null && this.outputHtmlReport !== '') {
      let prefix = '';
      if (this.outputHtmlReport.substring(0, 1) != '/') {
        prefix = tmpDir + pathDelimiter;
      }
      params.push(`--output-html-report='${prefix}${this.outputHtmlReport}'`);
    }
    if (this.outputJsonFile !== null && this.outputJsonFile !== '') {
      let prefix = '';
      if (this.outputJsonFile.substring(0, 1) != '/') {
        prefix = tmpDir + pathDelimiter;
      }
      params.push(`--output-json-file='${prefix}${this.outputJsonFile}'`);
    }
    if (this.outputTextFile !== null && this.outputTextFile !== '') {
      let prefix = '';
      if (this.outputTextFile.substring(0, 1) != '/') {
        prefix = tmpDir + pathDelimiter;
      }
      params.push(`--output-text-file='${prefix}${this.outputTextFile}'`);
    }
    if (this.addHostToOutputFile) params.push(`--add-host-to-output-file`);
    if (this.addTimestampToOutputFile) params.push(`--add-timestamp-to-output-file`);

    // Mailer options
    if (this.mailTo !== null) {
      this.mailTo.forEach((email) => {
        if (email !== null && email.trim() !== '') {
          params.push(`--mail-to='${email}'`);
        }
      });
    }
    if (this.mailFrom !== null) params.push(`--mail-from='${this.mailFrom}'`);
    if (this.mailFromName !== null) params.push(`--mail-from-name='${this.mailFromName}'`);
    if (this.mailSubjectTemplate !== null)
      params.push(`--mail-subject-template='${this.mailSubjectTemplate}'`);
    if (this.mailSmtpHost !== null) params.push(`--mail-smtp-host='${this.mailSmtpHost}'`);
    if (this.mailSmtpPort !== null) params.push(`--mail-smtp-port='${this.mailSmtpPort}'`);
    if (this.mailSmtpUser !== null) params.push(`--mail-smtp-user='${this.mailSmtpUser}'`);
    if (this.mailSmtpPass !== null) params.push(`--mail-smtp-pass='${this.mailSmtpPass}'`);

    // Crawling scope
    if (this.singleForeignPage) params.push(`--single-foreign-page`);
    if (this.rowsLimit !== null) params.push(`--rows-limit=${this.rowsLimit}`);
    if (this.maxSkippedUrls !== null) params.push(`--max-skipped-urls=${this.maxSkippedUrls}`);
    if (this.maxNon200ResponsesPerBasename !== null)
      params.push(`--max-non200-responses-per-basename=${this.maxNon200ResponsesPerBasename}`);
    if (this.resolve !== null) params.push(`--resolve='${this.resolve}'`);

    // Markdown export options
    if (this.markdownExportDir !== null) {
      let prefix = '';
      if (this.markdownExportDir.substring(0, 1) != '/') {
        prefix = tmpDir + pathDelimiter;
      }
      params.push(`--markdown-export-dir='${prefix}${this.markdownExportDir}'`);
    }
    if (this.markdownExportStoreOnlyUrlRegex !== null) {
      this.markdownExportStoreOnlyUrlRegex.forEach((regex) => {
        if (regex !== null && regex.trim() !== '') {
          params.push(`--markdown-export-store-only-url-regex='${regex}'`);
        }
      });
    }
    if (this.markdownDisableImages) params.push(`--markdown-disable-images`);
    if (this.markdownDisableFiles) params.push(`--markdown-disable-files`);
    if (this.markdownExcludeSelector !== null)
      params.push(`--markdown-exclude-selector='${this.markdownExcludeSelector}'`);
    if (this.markdownReplaceContent !== null)
      params.push(`--markdown-replace-content='${this.markdownReplaceContent}'`);
    if (this.markdownReplaceQueryString !== null)
      params.push(`--markdown-replace-query-string='${this.markdownReplaceQueryString}'`);
    if (this.markdownIgnoreStoreFileError) params.push(`--markdown-ignore-store-file-error`);
    if (this.markdownExportSingleFile !== null) {
      let prefix = '';
      if (this.markdownExportSingleFile.substring(0, 1) != '/') {
        prefix = tmpDir + pathDelimiter;
      }
      params.push(`--markdown-export-single-file='${prefix}${this.markdownExportSingleFile}'`);
    }
    if (this.markdownMoveContentBeforeH1ToEnd)
      params.push(`--markdown-move-content-before-h1-to-end`);
    if (this.markdownRemoveLinksAndImagesFromSingleFile)
      params.push(`--markdown-remove-links-and-images-from-single-file`);

    // Offline exporter options
    if (this.offlineExportDir !== null) {
      let prefix = '';
      if (this.offlineExportDir.substring(0, 1) != '/') {
        prefix = tmpDir + pathDelimiter;
      }
      params.push(`--offline-export-dir='${prefix}${this.offlineExportDir}'`);
    }
    if (this.offlineExportStoreOnlyUrlRegex !== null) {
      this.offlineExportStoreOnlyUrlRegex.forEach((regex) => {
        if (regex !== null && regex.trim() !== '') {
          params.push(`--offline-export-store-only-url-regex='${regex}'`);
        }
      });
    }
    if (this.offlineExportRemoveUnwantedCode) params.push(`--offline-export-remove-unwanted-code`);
    if (this.offlineExportNoAutoRedirectHtml) params.push(`--offline-export-no-auto-redirect-html`);
    if (this.replaceContent !== null) params.push(`--replace-content='${this.replaceContent}'`);
    if (this.replaceQueryString !== null)
      params.push(`--replace-query-string='${this.replaceQueryString}'`);
    if (this.ignoreStoreFileError) params.push(`--ignore-store-file-error`);

    // Sitemap options
    if (this.sitemapXmlFile !== null && this.sitemapXmlFile !== '') {
      let prefix = '';
      if (this.sitemapXmlFile.substring(0, 1) != '/') {
        prefix = tmpDir + pathDelimiter;
      }
      params.push(`--sitemap-xml-file='${prefix}${this.sitemapXmlFile}'`);
    }
    if (this.sitemapTxtFile !== null) {
      let prefix = '';
      if (this.sitemapTxtFile.substring(0, 1) != '/') {
        prefix = tmpDir + pathDelimiter;
      }
      params.push(`--sitemap-txt-file='${prefix}${this.sitemapTxtFile}'`);
    }
    if (this.sitemapBasePriority !== null)
      params.push(`--sitemap-base-priority=${this.sitemapBasePriority}`);
    if (this.sitemapPriorityIncrease !== null)
      params.push(`--sitemap-priority-increase=${this.sitemapPriorityIncrease}`);

    // Fastest URL analyzer
    if (this.fastestUrlsTopLimit !== null)
      params.push(`--fastest-urls-top-limit=${this.fastestUrlsTopLimit}`);
    if (this.fastestUrlsMaxTime !== null)
      params.push(`--fastest-urls-max-time=${this.fastestUrlsMaxTime}`);

    // SEO and OpenGraph analyzer
    if (this.maxHeadingLevel !== null) params.push(`--max-heading-level=${this.maxHeadingLevel}`);

    // Slowest URL analyzer
    if (this.slowestUrlsTopLimit !== null)
      params.push(`--slowest-urls-top-limit=${this.slowestUrlsTopLimit}`);
    if (this.slowestUrlsMinTime !== null)
      params.push(`--slowest-urls-min-time=${this.slowestUrlsMinTime}`);
    if (this.slowestUrlsMaxTime !== null)
      params.push(`--slowest-urls-max-time=${this.slowestUrlsMaxTime}`);

    return params;
  }

  // public getDomainFromUrl(): string {
  //     if (this.url === null || this.url.trim().match(/^https?:\/\/$/i)) {
  //         return '';
  //     }
  //     return this.url.replace(/^https?:\/\/([^/]+).*?$/i, '$1');
  // }

  private makeCorrections(): void {
    if (this.offlineExportDir !== null && this.offlineExportDir.trim() === '') {
      this.offlineExportDir = '%domain%';
    }
    if (this.sitemapXmlFile !== null && this.sitemapXmlFile.trim() === '.sitemap.xml') {
      this.sitemapXmlFile = '%domain%.sitemap.xml';
    }
    if (this.sitemapTxtFile !== null && this.sitemapTxtFile.trim() === '.sitemap.txt') {
      this.sitemapTxtFile = '%domain%.sitemap.txt';
    }
  }
}

export default CrawlerFormContent;
