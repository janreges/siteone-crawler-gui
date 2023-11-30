class CrawlerFormContent {

    // Basic settings
    url: string | null = 'https://';
    device: 'desktop' | 'tablet' | 'mobile' | null = null;
    userAgent: string | null = null;
    timeout: number | null = null;
    proxy: string | null = null;
    httpAuth: string | null = null;
    help: boolean | null = null;
    version: boolean | null = null;

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

    // Resource filtering
    disableJavascript: boolean | null = null;
    disableStyles: boolean | null = null;
    disableFonts: boolean | null = null;
    disableImages: boolean | null = null;
    disableFiles: boolean | null = null;
    removeAllAnchorListeners: boolean | null = null;

    // Advanced crawler settings
    workers: number | null = 1;
    maxReqsPerSec: number | null = 10;
    memoryLimit: string | null = null;
    allowedDomainForExternalFiles: string[] | null = ['*'];
    allowedDomainForCrawling: string[] | null = [];
    includeRegex: string | null = null;
    ignoreRegex: string | null = null;
    analyzerFilterRegex: string | null = null;
    acceptEncoding: string | null = null;
    removeQueryParams: boolean | null = null;
    addRandomQueryParams: boolean | null = null;
    maxQueueLength: number | null = null;
    maxVisitedUrls: number | null = 10100;
    maxUrlLength: number | null = null;

    // Expert settings
    debug: boolean | null = null;
    debugLogFile: string | null = null;
    debugUrlRegex: string | null = null;
    resultStorage: 'memory' | 'file' | null = 'memory';
    resultStorageDir: string | null = null;
    resultStorageCompression: boolean | null = null;
    httpCacheDir: string | null = null;
    httpCacheCompression: boolean | null = null;
    websocketServer: string | null = null;
    consoleWidth: number | null = null;

    // File export settings
    outputHtmlReport: string | null = null;
    outputJsonFile: string | null = null;
    outputTextFile: string | null = null;
    addHostToOutputFile: boolean | null = null;
    addTimestampToOutputFile: boolean | null = null;

    // Mailer options
    mailTo: string | null = null;
    mailFrom: string | null = null;
    mailFromName: string | null = null;
    mailSubjectTemplate: string | null = null;
    mailSmtpHost: string | null = null;
    mailSmtpPort: number | null = null;
    mailSmtpUser: string | null = null;
    mailSmtpPass: string | null = null;

    // Offline exporter options
    offlineExportDirectory: string | null = null;
    offlineExportStoreOnlyUrlRegex: string | null = null;

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

    // URL params
    cliParams: string[] = [];

    constructor(init: Partial<CrawlerFormContent>) {
        Object.assign(this, init);
    }

    generateCliParams(): string[] {
        const params: string[] = [];

        // make corrections for specific params/cases
        this.makeCorrections();

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
        if (this.extraColumns !== null && this.extraColumns.trim() !== '') params.push(`--extra-columns=${this.extraColumns}`);
        if (this.urlColumnSize !== null) params.push(`--url-column-size=${this.urlColumnSize}`);
        if (this.showInlineCriticals) params.push(`--show-inline-criticals`);
        if (this.showInlineWarnings) params.push(`--show-inline-warnings`);
        if (this.doNotTruncateUrl) params.push(`--do-not-truncate-url`);
        if (this.showSchemeAndHost) params.push(`--show-scheme-and-host`);
        if (this.hideProgressBar) params.push(`--hide-progress-bar`);
        if (this.noColor) params.push(`--no-color`);
        if (this.forceColor) params.push(`--force-color`);

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
        if (this.allowedDomainForExternalFiles !== null) {
            this.allowedDomainForExternalFiles.forEach((domain) => {
                if (domain !== null && domain.trim() !== '') {
                    params.push(`--allowed-domain-for-external-files=${domain}`);
                }
            });
        }
        if (this.allowedDomainForCrawling !== null) {
            this.allowedDomainForCrawling.forEach((domain) => {
                if (domain !== null && domain.trim() !== '') {
                    params.push(`--allowed-domain-for-crawling=${domain}`);
                }
            });
        }
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
        if (this.httpCacheDir !== null) params.push(`--http-cache-dir='${this.httpCacheDir}'`);
        if (this.httpCacheCompression) params.push(`--http-cache-compression`);
        if (this.websocketServer !== null) params.push(`--websocket-server=${this.websocketServer}`);
        if (this.consoleWidth !== null) params.push(`--console-width=${this.consoleWidth}`);

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

    public getDomainFromUrl(): string {
        if (this.url === null || this.url.trim().match(/^https?:\/\/$/i)) {
            return '';
        }
        return this.url.replace(/^https?:\/\/([^/]+).*?$/i, '$1');
    }

    private makeCorrections(): void {
      // this is ugly, but I don't have a time to do it better
      if (this.offlineExportDirectory !== null && (this.offlineExportDirectory.trim() === 'tmp' || this.offlineExportDirectory.trim() === 'tmp/')) {
        this.offlineExportDirectory = 'tmp/' + this.getDomainFromUrl();
      }
      if (this.sitemapXmlFile !== null && this.sitemapXmlFile.trim() === 'tmp/.sitemap.xml') {
        this.sitemapXmlFile = 'tmp/' + this.getDomainFromUrl() + '.sitemap.xml';
      }
      if (this.sitemapTxtFile !== null && this.sitemapTxtFile.trim() === 'tmp/.sitemap.txt') {
        this.sitemapTxtFile = 'tmp/' + this.getDomainFromUrl() + '.sitemap.txt';
      }
    }

}

export default CrawlerFormContent;
