<script lang="ts">

    // NOTE: When developing the first version, I focused on functionality and the fastest possible startup time.
    // In the following versions, this large component will be divided and refactored into approx. 5-7 components.

    import "xterm/css/xterm.css";
    import ValInput from './form/ValInput.svelte';
    import FileInput from './form/FileInput.svelte';
    import IntInput from './form/IntInput.svelte';
    import BasicFormPart from './form/BasicFormPart.svelte';
    import HostPortInput from './form/HostPortInput.svelte';
    import SizeInput from './form/SizeInput.svelte';
    import RegexInput from './form/RegexInput.svelte';
    import DirInput from './form/DirInput.svelte';
    import EmailInput from './form/EmailInput.svelte';
    import SelectInput from './form/SelectInput.svelte';
    import CheckboxInput from './form/CheckboxInput.svelte';
    import CrawlerFormContent from '../types/CrawlerFormContent';
    import PasswordInput from './form/PasswordInput.svelte';
    import ResolveInput from './form/ResolveInput.svelte';
    import HttpAuthInput from './form/HttpAuthInput.svelte';
    import type {CrawlerMessage} from '../../../main/crawler/CrawlerMessage';
    import {CrawlerMessageType} from '../../../main/crawler/CrawlerMessage';
    import {HistoryStorage} from "../history/HistoryStorage";
    import {HistoryItem} from "../history/HistoryItem";
    import { Terminal } from "xterm";
    import { FitAddon } from "xterm-addon-fit";
    import { CanvasAddon } from "xterm-addon-canvas";
    import {onMount} from "svelte";
    import Timeline from "./Timeline.svelte";
    import {TimelineState} from "../types/TimelineState";
    import BasicForm from './BasicForm.svelte';
    import { VERSION } from '../types/CrawlerInfo';
    import CrawlerMiniStats from "./MiniStats.svelte";
    import { MiniStatsData } from '../types/MiniStatsData';
    import NetworkStats from './NetworkStats.svelte';
    import ResultPage from './ResultPage.svelte';
    import { timezones } from '../data/timezones';

    let terminal;
    var term;
    let lastCliParams: string[] = [];

    // const CRAWLER_IS_NOT_RUNNING = 'Crawler is not running...';
    let CRAWLER_IS_STARTING = 'Crawler is starting...';
    const CRAWLER_STOPPED = 'Crawler stopped.';

    export const STATE_NOT_RUNNING = 'not-running';
    export const STATE_RUNNING = 'running';
    export const STATE_STOPPING = 'stopping';

    const fontPerPlatform = {
        'win32': 'Consolas',
        'darwin': 'Monaco',
        'linux': 'DejaVu Sans Mono'
    };

    let formState: string = STATE_NOT_RUNNING;
    let hasResult: boolean = false;
    let historyStorage:HistoryStorage = new HistoryStorage();
    var timeoutIdToResult;

    const timelineState = new TimelineState();
    let miniStatsData = new MiniStatsData();
    let networkStats: typeof NetworkStats;

    export let formData: CrawlerFormContent = null;

    export let windowWidth: number;
    export let windowHeight: number;
    let reportBaseFilePath: string | null = null;
    let offlineWebsiteDir: string | null = null;
    let markdownWebsiteDir: string | null = null;
    let sitemapXmlFile: string | null = null;
    let sitemapTxtFile: string | null = null;
    let htmlReportUrl: string | null = null;

    let basicFormPartHeight: number = 0;
    $: terminalWidth = windowWidth - 20;
    $: terminalHeight = windowHeight - basicFormPartHeight - 140;

    let activeTab: string = 'basic';
    let osPlatform: string | null = null;
    let osArchitecture: string | null = null;
    let consoleFontFamily: string | null = null;
    let isWindows: boolean = false;
    
    // Helper function to shorten long timezone names
    function shortenTimezone(tz: string, maxLength: number = 20): string {
        if (!tz || tz.length <= maxLength) return tz;
        
        const halfLength = Math.floor((maxLength - 2) / 2);
        const start = tz.substring(0, halfLength);
        const end = tz.substring(tz.length - halfLength);
        
        return `${start}..${end}`;
    }
    
    // Create timezone options with empty default
    const timezoneOptions = ['', ...timezones];
    const timezoneLabels = timezoneOptions.map(tz => shortenTimezone(tz));

    if (formData === null) {
        formData = new CrawlerFormContent({});
    }

    $: allowedDomainForCrawlingString = domainsToString(formData.allowedDomainForCrawling);
    $: allowedDomainForExternalString = domainsToString(formData.allowedDomainForExternalFiles);

    onMount(async () => {
        osPlatform = window.api.getPlatform();
        osArchitecture = window.api.getArchitecture();
        isWindows = osPlatform === 'win32';
        consoleFontFamily = osPlatform ? fontPerPlatform[osPlatform] : 'monospace';

        // add info about slow first start on Windows and set workers to 3 on Linux/macOS (Windows has 1 as default due to issues with multiple workers on Cygwin)
        if (isWindows) {
            CRAWLER_IS_STARTING = 'Crawler is starting - it may take tens of seconds when first running on Windows...';
        } else {
            formData.workers = 3;
        }

        const fontSize: number = isWindows ? 12 : 11;
        term = new Terminal({
            fontSize: fontSize,
            fontFamily: consoleFontFamily,
            cols: getTerminalCols(),
            rows: getTerminalRows(),
            scrollback: Number.MAX_SAFE_INTEGER,
            allowProposedApi: true,
            theme: {
                background: '#111111'
            }
        });
        var fitAddon = new FitAddon();
        term.open(terminal);
        term.loadAddon(new CanvasAddon());
        term.loadAddon(fitAddon);
        fitAddon.fit();
        term.writeln('Hello from SiteOne Crawler! Enter the URL above and let me do my work :-)');
    });

    const crawlerMessageHandler: (event: any, message: CrawlerMessage) => void = function (_event, message) {
        switch(message.type) {

            case CrawlerMessageType.STARTED:
                term.writeln(CRAWLER_IS_STARTING);
                term.scrollToBottom();
                break;

            case CrawlerMessageType.STOPPED:
                term.writeln(CRAWLER_STOPPED);
                term.scrollToBottom();
                formState = STATE_NOT_RUNNING;
                hasResult = true;
                if (timelineState.htmlReport) {
                    timelineState.finished = true;
                }
                break;

            case CrawlerMessageType.STDOUT_DATA:
                let lines = message.data.message.trim().split(/\r?\n/);
                lines.map(async (line) => {
                    if (line && line.includes('HTML report saved')) {
                        reportBaseFilePath = getReportBaseFilePath(line);
                        timelineState.htmlReport = true;
                        if (timeoutIdToResult) {
                            clearTimeout(timeoutIdToResult)
                        }
                        timeoutIdToResult = setTimeout(() => activeTab = 'result', 1000);
                    } else if (line && line.includes('Offline website generated to')) {
                        offlineWebsiteDir = getOfflineVersionBasePath(line);
                        timelineState.offlineExport = true;
                        if (timeoutIdToResult) {
                            clearTimeout(timeoutIdToResult)
                        }
                        timeoutIdToResult = setTimeout(() => activeTab = 'result', 1000);
                    } else if (line && line.includes('Markdown content generated to')) {
                        markdownWebsiteDir = getMarkdownVersionBasePath(line);
                        timelineState.markdownExport = true;
                        if (timeoutIdToResult) {
                            clearTimeout(timeoutIdToResult)
                        }
                        timeoutIdToResult = setTimeout(() => activeTab = 'result', 1000);
                    } else if (line && line.includes('Markdown files combined into single file')) {
                        const singleFilePath = getMarkdownSingleFilePath(line);
                        if (singleFilePath && formData.markdownExportSingleFile) {
                            formData.markdownExportSingleFile = singleFilePath;
                        }
                        if (timeoutIdToResult) {
                            clearTimeout(timeoutIdToResult)
                        }
                        timeoutIdToResult = setTimeout(() => activeTab = 'result', 1000);
                    } else if (line && line.includes('XML sitemap generated to')) {
                        sitemapXmlFile = getSitemapXmlPath(line);
                    } else if (line && line.includes('TXT sitemap generated to')) {
                        sitemapTxtFile = getSitemapTxtPath(line);
                    } else if (line && line.includes('HTML report uploaded to')) {
                        htmlReportUrl = getUploadedReportUrl(line);
                    }
                    else {
                        var match = line.match(/^(\d+)\/(\d+)\s*\|\s*([\d%]*)/);
                        if (match) {
                            const compactMode = match[3] && match[3].includes('%') ? false : true;
                            timelineState.progressCurrent = parseInt(match[1]);
                            timelineState.progressTotal = parseInt(match[2]);

                            let info;
                            if (compactMode) {
                                timelineState.progressPercentage = Math.round(timelineState.progressCurrent / timelineState.progressTotal * 100);
                                // modify line to same as in non-compact mode for parser in handleUrlInfoLine
                                const lineToParse = line.replace(
                                  match[0],
                                  timelineState.progressCurrent + '/' + timelineState.progressTotal + ' | ' + timelineState.progressPercentage + '%' + ' |> | '
                                );
                                info = miniStatsData.handleUrlInfoLine(lineToParse);
                            } else {
                                timelineState.progressPercentage = parseInt(match[3].replace('%', ''));
                                info = miniStatsData.handleUrlInfoLine(line);
                            }

                            miniStatsData = miniStatsData;

                            // update network statsu
                            if (networkStats) {
                                networkStats.addProcessedUrl(info.fileType, info.duration, info.size);
                            }
                        }
                    }
                    term.writeln(line);
                });
                break;
        }
    };

    const onRun = async function (): void {
        activeTab = 'output';
        formState = STATE_RUNNING;
        reportBaseFilePath = null;
        offlineWebsiteDir = null;
        sitemapXmlFile = null;
        sitemapTxtFile = null;

        miniStatsData.reset();
        miniStatsData = miniStatsData;
        timelineState.reset();
        timelineState.started = true;

        networkStats.reset();

        const tmpDir = await window.api.getTmpDir();
        const pathDelimiter = isWindows ? '\\' : '/';

        formData.consoleWidth = getTerminalCols();
        formData.cliParams = formData.generateCliParams(tmpDir, pathDelimiter);
        lastCliParams = formData.cliParams;
        console.log('CLI params', formData.cliParams);

        term.resize(getTerminalCols(), getTerminalRows());
        term.writeln(CRAWLER_IS_STARTING);
        term.scrollToBottom();

        window.api.setMessageToBackend({type: CrawlerMessageType.START, data: formData});

        const datetime = getCurrentDateTime();
        historyStorage.addItem(new HistoryItem(datetime, formData.url, JSON.stringify(formData)));
        historyStorage = historyStorage;
    };

    const onStop = function (): void {
        formState = STATE_STOPPING;
        window.api.setMessageToBackend({type: CrawlerMessageType.STOP, data: formData});
    };

    function handleLoadFromHistory(event) {
        formData = event.detail;
        handleUrlChange();
    }

    function getCurrentDateTime() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    function getTerminalCols() {
        return Math.floor(terminalWidth / 7);
    }

    function getTerminalRows() {
        const osPlatform = window.api.getPlatform();

        let rowHeight = 15; // default, e.g. for Windows - works well with Consolas font size 12 (tuned on Windows 11)
        if (osPlatform === 'darwin') {
            rowHeight = 15.5; // works well with Monaco font size 11 (tuned on macOS Sonoma 14)
        } else if (osPlatform === 'linux') {
            rowHeight = 13.5; // works well with DejaVu Sans Mono font size 11 (tuned on Ubuntu 22.04)
        }

        return Math.floor(terminalHeight / rowHeight);
    }

    export function handleResize(): void {
        setTimeout(() => term.resize(getTerminalCols(), getTerminalRows()), 50);
    }

    function getReportBaseFilePath(text: string): string | null {
        const regex = /HTML report saved to '([^']+)'/;
        const match = text.match(regex);
        if (match && match[1]) {
            return match[1].replace('.html', '');
        }
        return null;
    }

    function getOfflineVersionBasePath(text: string): string | null {
        const regex = /Offline website generated to '([^']+)'/;
        const match = text.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }

    function getMarkdownVersionBasePath(text: string): string | null {
        const regex = /Markdown content generated to '([^']+)'/;
        const match = text.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }

    function getSitemapXmlPath(text: string): string | null {
        const regex = /XML sitemap generated to '([^']+)'/;
        const match = text.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }

    function getSitemapTxtPath(text: string): string | null {
        const regex = /TXT sitemap generated to '([^']+)'/;
        const match = text.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }

    function getMarkdownSingleFilePath(text: string): string | null {
        const regex = /Markdown files combined into single file '([^']+)'/;
        const match = text.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }

    function getUploadedReportUrl(text: string): string | null {
      const regex = /HTML report uploaded to '([^']+)'/;
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    }

    function openHtmlReport(): void {
      window.api.openExternal('file://' + reportBaseFilePath + '.html');
    }

    function openOfflineExport():void {
        window.api.openExternal('file://' + offlineWebsiteDir + '/index.html');
    }

    function openCrawlerHomepage():void {
      window.api.openExternal('https://crawler.siteone.io/?utm_source=app&utm_medium='+osPlatform+'&utm_campaign='+osArchitecture+'&utm_content='+VERSION);
    }

    function domainsToString(domainsArray:string[]): string {
        return domainsArray ? domainsArray.join(',') : '';
    }

    function stringToDomains(domainsString:string): string[] {
        return domainsString.split(',').map(domain => domain.trim());
    }

    function handleAllowedDomainForCrawlingChange(event): void {
        formData.allowedDomainForCrawling = stringToDomains(event.detail.currentTarget.value);
    }

    function handleAllowedDomainForExternalFilesChange(event): void {
        formData.allowedDomainForExternalFiles = stringToDomains(event.detail.currentTarget.value);
    }

    function handleUrlChange(): void {
        if (formData.url.match(/^https?:\/\/[a-z0-9]/)) {
            // if URL changed and offline export dir was set, then recalculate it
            formData.offlineExportDir = formData.offlineExportDir !== null ? '%domain%' : null;
        }
    }

    window.api.onCrawlerMessage(crawlerMessageHandler);

</script>

<form class="max-h-screen h-screen w-full">
    <!-- URL -->

    <div>
        <BasicFormPart bind:value={formData.url} bind:containerDivHeight={basicFormPartHeight} on:run={onRun} on:stop={onStop} label="URL"
                       on:loadFromHistory={handleLoadFromHistory} {historyStorage} bind:htmlReportFilePath={reportBaseFilePath}
                       on:openCrawlerHomepage={openCrawlerHomepage} on:urlChange={handleUrlChange}
                       {formState} tooltip="Base URL where to start browsing the website (http:// or https://).">
            <Timeline
              state={timelineState}
              fontFamily={consoleFontFamily}
              on:openHtmlReport={openHtmlReport}
              on:openOfflineExport={openOfflineExport}
            />
        </BasicFormPart>
    </div>
    <div role="tablist" class="tabs tabs-bordered" style="position: relative;">
        <NetworkStats
          bind:this={networkStats}
          state={formState}
          show={activeTab === 'output' || activeTab === 'result'}
          crawlingDone={timelineState.progressPercentage === 100 && timelineState.progressCurrent === timelineState.progressTotal}
        />
        <a role="tab" class="tab font-semibold text-gray-300" class:tab-active={activeTab === 'basic'}
         on:click={() => activeTab = 'basic'}>Basic&nbsp;settings</a>
        <a role="tab" class="tab font-semibold text-gray-300" class:tab-active={activeTab === 'setup'}
           on:click={() => activeTab = 'setup'}>Full&nbsp;settings</a>
        <a role="tab" class="tab font-semibold text-gray-300" class:tab-active={activeTab === 'output'}
           on:click={() => activeTab = 'output'}>Output</a>
        <a role="tab" class="tab font-semibold" class:tab-active={activeTab === 'result'}
           class:tab-disabled={!hasResult} on:click={() => hasResult ? (activeTab = 'result') : null}>Result</a>

        <div role="tabpanel" class="tab-content  pt-4 h-full max-h-full w-full"
             class:tab-content-active={activeTab === 'basic'}>

            <BasicForm bind:data={formData} platform={osPlatform} />

        </div>

        <div role="tabpanel" class="tab-content  pt-4 h-full max-h-full w-full"
             class:tab-content-active={activeTab === 'setup'}>
            <div class="fieldset-container">
                <!-- Basic settings -->
                <fieldset>
                    <legend>Basic Settings</legend>
                    <IntInput bind:value={formData.maxDepth} label="Max Depth"
                              tooltip="Maximum crawling depth (for pages, not assets). Default is 0 (no limit). 1 means /about or /about/, 2 means /about/contacts etc."/>
                    <SelectInput bind:value={formData.device} label="Device Type"
                                 tooltip="Device type for User-Agent selection." options={['desktop', 'tablet', 'mobile']}/>
                    <ValInput bind:value={formData.userAgent} label="User Agent"
                              tooltip="Override User-Agent selected by --device."/>
                    <IntInput bind:value={formData.timeout} label="Timeout" tooltip="Request timeout (in sec)."/>
                    <HostPortInput bind:value={formData.proxy} label="Proxy"
                                   tooltip="HTTP proxy in `host:port` format."/>
                    <HttpAuthInput bind:value={formData.httpAuth} label="HTTP Authentication"
                                   tooltip="Basic HTTP authentication in `username:password` format."/>
                    <IntInput bind:value={formData.workers} label="Max Concurrent Workers"
                              tooltip="Max concurrent workers (threads)."/>
                    <IntInput bind:value={formData.maxReqsPerSec} label="Max Requests Per Second"
                              tooltip="Max requests/s for whole crawler."/>
                </fieldset>

                <!-- Output settings -->
                <fieldset>
                    <legend>Output Settings</legend>
                    <ValInput bind:value={formData.extraColumns} label="Extra Columns"
                              tooltip="Extra table headers for output table, e.g., `DOM,X-Cache(10),Title(40>)`."/>
                    <IntInput bind:value={formData.urlColumnSize} label="URL Column Size" tooltip="URL column width in the console output."/>
                    <IntInput bind:value={formData.rowsLimit} label="Rows Limit"
                              tooltip="Max. number of rows to display in tables with analysis results (protection against very long and slow report)."/>
                    <ValInput bind:value={formData.htmlReportOptions} label="HTML Report Options"
                              tooltip="Additional options for HTML report generation."/>
                    <CheckboxInput bind:checked={formData.showInlineCriticals} label="Show Inline Criticals"
                                   tooltip="Show criticals from the analyzer directly in the URL table."/>
                    <CheckboxInput bind:checked={formData.showInlineWarnings} label="Show Inline Warnings"
                                   tooltip="Show warnings from the analyzer directly in the URL table."/>
                    <CheckboxInput bind:checked={formData.doNotTruncateUrl} label="Do Not Truncate URL"
                                   tooltip="Avoid truncating URLs to `--url-column-size`."/>
                    <CheckboxInput bind:checked={formData.showSchemeAndHost} label="Show Scheme and Host"
                                   tooltip="Show the schema://host also of the original domain URL as well."/>
                    <CheckboxInput bind:checked={formData.hideProgressBar} label="Hide Progress Bar"
                                   tooltip="Suppress progress bar in output."/>
                    <CheckboxInput bind:checked={formData.noColor} label="Disable Colored Output"
                                   tooltip="Disable colored output."/>
                </fieldset>

                <!-- Resource filtering -->
                <fieldset>
                    <legend>Resource Filtering</legend>
                    <CheckboxInput bind:checked={formData.singlePage} label="Single Page"
                                   tooltip="Load only one page to which the URL is given (and its assets), but do not follow other pages."/>
                    <CheckboxInput bind:checked={formData.singleForeignPage} label="Single Foreign Page"
                                   tooltip="If crawling of other domains is allowed (using --allowed-domain-for-crawling), it ensures that when another domain is not on same second-level domain, only that linked page and its assets are crawled from that foreign domain."/>
                    <CheckboxInput bind:checked={formData.disableAllAssets} label="Disable All Assets"
                                   tooltip="Disables crawling of all assets and files and only crawls pages in href attributes. Shortcut for calling all other --disable-* flags."/>
                    <CheckboxInput bind:checked={formData.disableJavascript} label="Disable JavaScript"
                                   tooltip="Disables JavaScript downloading and removes all JavaScript code from HTML."/>
                    <CheckboxInput bind:checked={formData.disableStyles} label="Disable Styles"
                                   tooltip="Disables CSS file downloading and removes all style definitions."/>
                    <CheckboxInput bind:checked={formData.disableFonts} label="Disable Fonts"
                                   tooltip="Disables font downloading and also removes all font/font-face definitions from CSS."/>
                    <CheckboxInput bind:checked={formData.disableImages} label="Disable Images"
                                   tooltip="Disables downloading of all images and replaces found images in HTML with placeholder image only."/>
                    <CheckboxInput bind:checked={formData.disableFiles} label="Disable Files"
                                   tooltip="Disables downloading of any files (typically downloadable documents) to which various links point."/>
                    <ValInput value={allowedDomainForExternalString} label="Allowed Domains for Ext. Files"
                            on:input={handleAllowedDomainForExternalFilesChange}
                            tooltip="Allows loading of file content (typically assets) from another domains as well. Comma delimited. You can use wildcards '*'."/>
                    <ValInput value={allowedDomainForCrawlingString} label="Allowed Domains for Crawling"
                            on:input={handleAllowedDomainForCrawlingChange}
                            tooltip="Allows crawling of all content (including pages) from other listed domains. Comma delimited. You can use wildcards '*'."/>
                </fieldset>

                <!-- Advanced crawler settings -->
                <fieldset>
                    <legend>Advanced Crawler Settings</legend>
                    <SizeInput bind:value={formData.memoryLimit} label="Memory Limit"
                               tooltip="Memory limit in units M (Megabytes) or G (Gigabytes)."/>
                    <ResolveInput bind:value={formData.resolve} label="Extra Domain Resolve"
                                  tooltip="Force domain:port to resolve to a specific IP. Format: domain:port:ip (e.g., www.example.com:80:127.0.0.1)"/>
                    <RegexInput bind:value={formData.includeRegex} label="Include Regex"
                                tooltip="Include only URLs matching at least one PCRE regex."/>
                    <RegexInput bind:value={formData.ignoreRegex} label="Ignore Regex"
                                tooltip="Ignore URLs matching any PCRE regex."/>
                    <RegexInput bind:value={formData.analyzerFilterRegex} label="Analyzer Filter Regex"
                                tooltip="Use only analyzers that match the specified regexp."/>
                    <CheckboxInput bind:checked={formData.removeQueryParams} label="Remove Query Parameters"
                                   tooltip="Remove URL query parameters from crawled URLs."/>
                    <CheckboxInput bind:checked={formData.addRandomQueryParams} label="Add Random Query Params"
                                   tooltip="Add random query parameters to each crawled URL."/>
                    <CheckboxInput bind:checked={formData.httpCacheCompression} label="Enable HTTP Cache Compression"
                                   tooltip="Enable compression for HTTP cache storage."/>
                    <CheckboxInput bind:checked={formData.resultStorageCompression}
                                   label="Enable Result Storage Compression"
                                   tooltip="Enable compression for results storage."/>
                    <CheckboxInput bind:checked={formData.regexFilteringOnlyForPages} label="Regex Filtering Only For Pages"
                                   tooltip="Apply regex filters only to pages, not to assets."/>
                    <CheckboxInput bind:checked={formData.ignoreRobotsTxt} label="Ignore Robots.txt"
                                   tooltip="Ignore robots.txt rules and crawl all URLs."/>

                </fieldset>

                <!-- Expert settings -->
                <fieldset>
                    <legend>Expert Settings</legend>
                    <SelectInput bind:value={formData.resultStorage} label="Result Storage Type"
                                 tooltip="Result storage type for content and headers." options={['memory', 'file']}/>
                    <DirInput bind:value={formData.resultStorageDir} label="Result Storage Directory"
                              tooltip="Directory for --result-storage=file."/>
                    <DirInput bind:value={formData.httpCacheDir} label="HTTP Cache Directory"
                              tooltip="Cache dir for HTTP responses."/>
                    <ValInput bind:value={formData.acceptEncoding} label="Accept Encoding"
                              tooltip="Set `Accept-Encoding` request header."/>
                    <ValInput bind:value={formData.transformUrl} label="Transform URL"
                              tooltip="Transform URLs using pattern 'search -> replace' or regex '/pattern/flags -> replacement'."/>
                    <IntInput bind:value={formData.maxQueueLength} label="Max Queue Length"
                              tooltip="Max URL queue length."/>
                    <IntInput bind:value={formData.maxVisitedUrls} label="Max Visited URLs"
                              tooltip="Max visited URLs."/>
                    <IntInput bind:value={formData.maxSkippedUrls} label="Max Skipped URLs"
                              tooltip="Max skipped URLs. It affects memory requirements."/>
                    <IntInput bind:value={formData.maxUrlLength} label="Max URL Length"
                              tooltip="Max URL length in chars."/>
                    <!--          <HostPortInput bind:value={formData.websocketServer} label="Websocket Server"-->
                    <!--                         tooltip="Start crawler with websocket server on given host:port."/>-->
                </fieldset>

                <!-- File export settings -->
                <fieldset>
                    <legend>File Export Settings</legend>
                    <FileInput bind:value={formData.outputHtmlReport} label="Output HTML Report"
                               tooltip="Save HTML report into that file."/>
                    <FileInput bind:value={formData.outputJsonFile} label="Output JSON File"
                               tooltip="Save report as JSON."/>
                    <FileInput bind:value={formData.outputTextFile} label="Output Text File"
                               tooltip="Save output as TXT."/>
                    <SelectInput bind:value={formData.timezone} label="Timezone"
                                 tooltip="Timezone for date/time operations (e.g., 'America/New_York', 'Europe/London')."
                                 options={timezoneOptions}
                                 optionLabels={timezoneLabels}/>
                    <CheckboxInput bind:checked={formData.addHostToOutputFile} label="Add Host to Output File"
                                   tooltip="Append initial URL host to filename except sitemaps."/>
                    <CheckboxInput bind:checked={formData.addTimestampToOutputFile} label="Add Timestamp to Output File"
                                   tooltip="Append timestamp to filename except sitemaps."/>
                </fieldset>

                <!-- Mailer options -->
                <fieldset>
                    <legend>Mailer Options</legend>
                    <EmailInput bind:value={formData.mailTo} label="E-mail To"
                                tooltip="E-mail report recipient address(es)."/>
                    <EmailInput bind:value={formData.mailFrom} label="E-mail From" tooltip="E-mail sender address."/>
                    <ValInput bind:value={formData.mailFromName} label="E-mail From Name"
                              tooltip="E-mail sender name."/>
                    <ValInput bind:value={formData.mailSubjectTemplate} label="Mail Subject Template"
                              tooltip="E-mail subject template. You can use dynamic variables %domain% and %datetime%."/>
                    <ValInput bind:value={formData.mailSmtpHost} label="SMTP Host" tooltip="SMTP host."/>
                    <IntInput bind:value={formData.mailSmtpPort} label="SMTP Port" tooltip="SMTP port."/>
                    <ValInput bind:value={formData.mailSmtpUser} label="SMTP User"
                              tooltip="SMTP user for authentication."/>
                    <PasswordInput bind:value={formData.mailSmtpPass} label="SMTP Password"
                                   tooltip="SMTP password for authentication."/>
                </fieldset>

                <!-- Website clone options -->
                <fieldset>
                    <legend>Website Clone Options</legend>
                    <DirInput bind:value={formData.offlineExportDir} label="Website Clone Directory"
                              tooltip="Name of directory in user-data folder where to save the clone (offline version) of the website. E.g. 'mydomain.tld'"/>
                    <ValInput bind:value={formData.replaceContent} label="Replace Content"
                              tooltip="Replace HTML/JS/CSS content with 'foo -> bar' or regexp in PREG format: '/card[0-9]/i -> card'."/>
                    <ValInput bind:value={formData.replaceQueryString} label="Replace Query String"
                              tooltip="Instead of using a short hash instead of a query string in the filename, just replace some characters. You can use simple format 'foo -> bar' or regexp in PREG format, e.g. '/([a-z]+)=([^&]*)(&|$)/i -> $1__$2'."/>
                    <CheckboxInput bind:checked={formData.offlineExportRemoveUnwantedCode} label="Remove Unwanted Code"
                              tooltip="Remove unwanted code for offline mode? Typically JS of the analytics, social networks, cookie consent, cross origins, etc."/>
                    <CheckboxInput bind:checked={formData.offlineExportNoAutoRedirectHtml} label="No Auto Redirect HTML"
                              tooltip="Disable automatic creation of redirect HTML files for subfolders that contain an index.html file. This solves situations for URLs where sometimes the URL ends with a slash, sometimes it doesn't."/>
                    <CheckboxInput bind:checked={formData.removeAllAnchorListeners} label="Remove All Anchor Listeners"
                              tooltip="On all links on the page remove any event listeners."/>
                    <CheckboxInput bind:checked={formData.ignoreStoreFileError} label="Ignore Store File Error"
                              tooltip="Ignores any file storing errors. The export process will continue."/>
                </fieldset>

                <!-- Markdown Export Options -->
                <fieldset>
                    <legend>Markdown Export Options</legend>
                    <DirInput bind:value={formData.markdownExportDir} label="Markdown Export Directory"
                              tooltip="Path to directory where to save the markdown version of the website."/>
                    <ValInput bind:value={formData.markdownExcludeSelector} label="Exclude Selector"
                              tooltip="Exclude some page content (DOM elements) from markdown export defined by CSS selectors like 'header', '.header', '#header', etc."/>
                    <ValInput bind:value={formData.markdownReplaceContent} label="Replace Content"
                              tooltip="Replace text content with 'foo -> bar' or regexp in PREG format: '/card[0-9]/i -> card'."/>
                    <ValInput bind:value={formData.markdownReplaceQueryString} label="Replace Query String"
                              tooltip="Instead of using a short hash instead of a query string in the filename, just replace some characters. You can use simple format 'foo -> bar' or regexp in PREG format, e.g. '/([a-z]+)=([^&]*)(&|$)/i -> $1__$2'."/>
                    <FileInput bind:value={formData.markdownExportSingleFile} label="Export Single File"
                              tooltip="Export all markdown content into a single file instead of multiple files."/>
                    <CheckboxInput bind:checked={formData.markdownDisableImages} label="Disable Images"
                              tooltip="Do not export and show images in markdown files. Images are enabled by default."/>
                    <CheckboxInput bind:checked={formData.markdownDisableFiles} label="Disable Files"
                              tooltip="Do not export and link files other than HTML/CSS/JS/fonts/images - eg. PDF, ZIP, etc. These files are enabled by default."/>
                    <CheckboxInput bind:checked={formData.markdownIgnoreStoreFileError} label="Ignore Store File Error"
                              tooltip="Ignores any file storing errors. The export process will continue."/>
                    <CheckboxInput bind:checked={formData.markdownMoveContentBeforeH1ToEnd} label="Move Content Before H1 to End"
                                   tooltip="Move content that appears before the first H1 heading to the end of the document."/>
                    <CheckboxInput bind:checked={formData.markdownRemoveLinksAndImagesFromSingleFile} label="Remove Links and Images from Single File"
                                   tooltip="Remove all links and images when exporting to a single markdown file."/>
                </fieldset>

                <!-- Sitemap options -->
                <fieldset>
                    <legend>Sitemap Options</legend>
                    <FileInput bind:value={formData.sitemapXmlFile} label="Sitemap XML File"
                               tooltip="Save sitemap to XML file. '.xml' added if missing."/>
                    <FileInput bind:value={formData.sitemapTxtFile} label="Sitemap TXT File"
                               tooltip="Save sitemap to TXT file. '.txt' added if missing."/>
                    <ValInput bind:value={formData.sitemapBasePriority} label="Sitemap Base Priority"
                              tooltip="Base priority for XML sitemap. Default value is `0.5`."/>
                    <ValInput bind:value={formData.sitemapPriorityIncrease} label="Sitemap Priority Increase"
                              tooltip="Priority increase value based on slashes count in the URL. Default value is `0.1`."/>
                </fieldset>

                <!-- SEO and OpenGraph analyzer -->
                <fieldset>
                    <legend>SEO and OpenGraph Analyzer</legend>
                    <IntInput bind:value={formData.maxHeadingLevel} label="Maximal Heading Level"
                              tooltip="Maximal analyzer heading level from 1 to 6."/>
                </fieldset>

                <!-- Online HTML report -->
                <fieldset>
                  <legend>Online HTML report</legend>
                  <CheckboxInput bind:checked={formData.upload} label="Upload report"
                            tooltip="If enabled, HTML report will be securely uploaded to the crawler.siteone.io server, kept for the set retention period and accessible via a secure unique URL. Optionally, it can also be password protected."/>
                  <ValInput bind:value={formData.uploadTo} label="Upload to URL"
                            tooltip="URL of the endpoint where to send the HTML report."/>
                  <SelectInput bind:value={formData.uploadRetention} label="Retention period"
                            tooltip="How long should the HTML report be available online for everyone who will have a unique URL to it?"
                            options={['1h', '4h', '12h', '24h', '3d', '7d', '30d', '365d', 'forever']}
                            />
                  <ValInput bind:value={formData.uploadPassword} label="Password"
                            tooltip="An optional password. If specified, must be filled in (with username 'crawler') when attempting to view the HTML report. Passwords are stored on the server in a secure format (Bcrypt or Argon2id)"/>
                  <IntInput bind:value={formData.uploadTimeout} label="Timeout"
                            tooltip="Timeout for uploading the HTML report (in seconds)."/>
                </fieldset>
            </div>
        </div>

        <div role="tabpanel" class="tab-content bg-base-100 pt-4 max-h-full h-full w-full"
             class:tab-content-active={activeTab === 'output'}>

            <div class="mockup-window border border-base-300 bg-base-300 max-h-full h-full w-full">
                <CrawlerMiniStats data={miniStatsData} fontFamily={consoleFontFamily} platform={osPlatform}/>
                <div id="terminal" class="terminal max-h-full h-full w-full" style="height: {terminalHeight}px; padding: 10px; background-color: #111;" bind:this={terminal}>

                </div>
            </div>
        </div>

        <div role="tabpanel" class="tab-content bg-base-100 pt-4 max-h-full h-full w-full" class:tab-content-active={activeTab === 'result'}>
            <ResultPage 
                {reportBaseFilePath}
                {offlineWebsiteDir}
                {markdownWebsiteDir}
                markdownSingleFile={formData.markdownExportSingleFile}
                {sitemapXmlFile}
                {sitemapTxtFile}
                {htmlReportUrl}
                {lastCliParams}
            />
        </div>

</form>

<style>

    form {
        padding: 10px;
    }

    form .fieldset-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        width: 100%;
        margin: auto;
        padding: 10px;
        box-sizing: border-box;
        font-size: 10px;
    }

    fieldset {
        border: 1px solid #333;
        border-radius: 4px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        flex: 1;
        min-width: 300px;
    }

    fieldset.url {
        display: block !important;
        width: 100% !important;
    }

    legend {
        padding: 0 10px;
        width: auto;
        margin-left: -10px;
        font-weight: bold;
    }

    :global(.form-group) {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
    }

    :global(label) {
        margin-bottom: 0;
        display: inline-block;
        min-width: 128px;
        font-size: 11px;
    }

    :global(input[type="text"]),
    :global(input[type="number"]),
    :global(input[type="email"]),
    :global(input[type="password"]),
    :global(select) {
        flex-grow: 1;
        color: oklch(var(--in)) !important;
        cursor: help;
    }

    :global(input[type="number"]) {
        max-width: 70px;
        flex-grow: 0;
    }

    :global(.form-group .error) {
        color: red;
        font-size: 11px;
        line-height: 11px;
    }

    @media (max-width: 768px) {
        form {
            flex-direction: column;
        }

        fieldset {
            width: 100%;
        }

        :global(.form-group) {
            flex-direction: column;
            align-items: flex-start;
        }

        :global(input[type="text"]),
        :global(input[type="number"]),
        :global(input[type="email"]),
        :global(input[type="password"]),
        :global(select) {
            width: 100%;
        }

        :global(input[type="number"]) {
            max-width: 100%;
        }
    }

    .tab-content-active {
        display: block;
    }

    :global(.checkbox) {
        border-radius: 2px !important;
    }

    :global(.link-to-online-report) {
      font-size: 0.8em;
      color: #666666;
    }

</style>
