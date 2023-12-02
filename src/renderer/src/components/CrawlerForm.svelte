<script lang="ts">
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
    import { PLATFORM, ARCHITECTURE, VERSION } from '../types/CrawlerInfo';
    import CrawlerMiniStats from "./MiniStats.svelte";
    import { MiniStatsData } from '../types/MiniStatsData';

    let terminal;
    var term;
    let lastCliParams: string[] = [];

    // const CRAWLER_IS_NOT_RUNNING = 'Crawler is not running...';
    const CRAWLER_IS_STARTING = 'Crawler is starting...';
    const CRAWLER_STOPPED = 'Crawler stopped.';

    export const STATE_NOT_RUNNING = 'not-running';
    export const STATE_RUNNING = 'running';
    export const STATE_STOPPING = 'stopping';

    let formState: string = STATE_NOT_RUNNING;
    let hasResult: boolean = false;
    let historyStorage:HistoryStorage = new HistoryStorage();
    var timeoutIdToResult;

    const timelineState = new TimelineState();
    let miniStatsData = new MiniStatsData();

    export let formData: CrawlerFormContent = null;

    export let windowWidth: number;
    export let windowHeight: number;
    let reportBaseFilePath: string | null = null;
    let offlineWebsiteDir: string | null = null;
    let sitemapXmlFile: string | null = null;
    let sitemapTxtFile: string | null = null;

    let basicFormPartHeight: number = 0;
    $: terminalWidth = windowWidth - 20;
    $: terminalHeight = windowHeight - basicFormPartHeight - 140;

    let activeTab: string = 'basic';
    let osPlatform: string | null = null;
    let consoleFontFamily: string | null = null;

    if (formData === null) {
        formData = new CrawlerFormContent({});
    }

    $: allowedDomainForCrawlingString = domainsToString(formData.allowedDomainForCrawling);
    $: allowedDomainForExternalString = domainsToString(formData.allowedDomainForExternalFiles);

    onMount(async () => {
        osPlatform = window.api.getPlatform();
        consoleFontFamily = osPlatform ? (osPlatform === 'win32' ? 'Consolas' : (osPlatform === 'darwin' ? 'Monaco' : 'DejaVu Sans Mono')) : 'monospace';
        const fontSize: number = osPlatform ? (osPlatform === 'darwin' ? 11 : 12) : 12;
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
                    } else if (line && line.includes('XML sitemap generated to')) {
                        sitemapXmlFile = getSitemapXmlPath(line);
                    } else if (line && line.includes('TXT sitemap generated to')) {
                        sitemapTxtFile = getSitemapTxtPath(line);
                    } else {
                        var match = line.match(/(\d+)\/(\d+)\s*\|\s*([\d%]*)/);
                        if (match) {
                            const compactMode = match[3] && match[3].includes('%') ? false : true;
                            timelineState.progressCurrent = parseInt(match[1]);
                            timelineState.progressTotal = parseInt(match[2]);

                            if (compactMode) {
                                timelineState.progressPercentage = Math.round(timelineState.progressCurrent / timelineState.progressTotal * 100);
                                // modify line to same as in non-compact mode for parser in handleUrlInfoLine
                                const lineToParse = line.replace(
                                  match[0],
                                  timelineState.progressCurrent + '/' + timelineState.progressTotal + ' | ' + timelineState.progressPercentage + '%' + ' |> | '
                                );
                                miniStatsData.handleUrlInfoLine(lineToParse);
                            } else {
                                timelineState.progressPercentage = parseInt(match[3].replace('%', ''));
                                miniStatsData.handleUrlInfoLine(line);
                            }
                            miniStatsData = miniStatsData;
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

        const tmpDir = await window.api.getTmpDir();
        const pathDelimiter = window.api.getPlatform() === 'win32' ? '\\' : '/';

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
        const rowHeight = osPlatform ? (osPlatform === 'darwin' ? 15.5 : 15) : 15;
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

    function openReportInBrowser(extension:string): void {
        window.api.openExternal('file://' + getReportFilePath(extension));
    }

    function openHtmlReport(): void {
      window.api.openExternal('file://' + getReportFilePath('html'));
    }

    function openOfflineVersion():void {
        window.api.openExternal('file://' + offlineWebsiteDir + '/index.html');
    }

    function openCrawlerHomepage():void {
      window.api.openExternal('https://crawler.siteone.io/?utm_source=app&utm_medium='+PLATFORM+'&utm_campaign='+ARCHITECTURE+'&utm_content='+VERSION);
    }

    function openSitemapXml():void {
        window.api.openExternal('file://' + sitemapXmlFile);
    }

    function openSitemapTxt():void {
        window.api.openExternal('file://' + sitemapTxtFile);
    }

    async function openTmpDir(): Promise<void> {
        window.api.openExternal('file://' + await window.api.getTmpDir());
    }

    function getReportFilePath(extension:string): string {
        let result = reportBaseFilePath + '.' + extension;
        if (extension === 'json' || extension === 'txt') {
            result = result.replace('report.', 'output.');
        }
        return result;
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
                       {formState} tooltip="Required URL. Enclose in quotes if URL contains query parameters.">
            <Timeline state={timelineState} on:openHtmlReport={openHtmlReport} />
        </BasicFormPart>
    </div>
    <div role="tablist" class="tabs tabs-bordered">
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

            <BasicForm bind:data={formData} />

        </div>

        <div role="tabpanel" class="tab-content  pt-4 h-full max-h-full w-full"
             class:tab-content-active={activeTab === 'setup'}>
            <div class="fieldset-container">
                <!-- Basic settings -->
                <fieldset>
                    <legend>Basic Settings</legend>
                    <SelectInput bind:value={formData.device} label="Device Type"
                                 tooltip="Device type for User-Agent selection."
                                 options={['desktop', 'tablet', 'mobile']}/>
                    <ValInput bind:value={formData.userAgent} label="User Agent"
                              tooltip="Override User-Agent selected by --device."/>
                    <IntInput bind:value={formData.timeout} label="Timeout" tooltip="Request timeout (in sec)."/>
                    <HostPortInput bind:value={formData.proxy} label="Proxy"
                                   tooltip="HTTP proxy in `host:port` format."/>
                    <ValInput bind:value={formData.httpAuth} label="HTTP Auth"
                              tooltip="Basic HTTP authentication in `username:password` format."/>
                    <IntInput bind:value={formData.workers} label="Max Concurrent Workers"
                              tooltip="Max concurrent workers (threads)."/>
                    <IntInput bind:value={formData.maxReqsPerSec} label="Max Requests Per Second"
                              tooltip="Max requests/s for whole crawler."/>
                </fieldset>

                <!-- Output settings -->
                <fieldset>
                    <legend>Output Settings</legend>
                    <SelectInput bind:value={formData.output} label="Output Type"
                                 tooltip="Output type `text` or `json`."
                                 options={['text', 'json']}/>
                    <ValInput bind:value={formData.extraColumns} label="Extra Columns"
                              tooltip="Extra table headers for output table, e.g., `DOM,X-Cache(10),Title(40>)`."/>
                    <IntInput bind:value={formData.urlColumnSize} label="URL Column Size" tooltip="URL column width."/>
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
                    <ValInput value={allowedDomainForExternalString} label="Allowed Domains for Ext. Files"
                              on:input={handleAllowedDomainForExternalFilesChange}
                              tooltip="Allows loading of file content from another domains as well. Comma delimited."/>
                    <ValInput value={allowedDomainForCrawlingString} label="Allowed Domains for Crawling"
                              on:input={handleAllowedDomainForCrawlingChange}
                              tooltip="Allows crawling of all content from other listed domains. Comma delimited."/>
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
                    <CheckboxInput bind:checked={formData.removeAllAnchorListeners} label="Remove All Anchor Listeners"
                                   tooltip="On all links on the page remove any event listeners."/>
                </fieldset>

                <!-- Advanced crawler settings -->
                <fieldset>
                    <legend>Advanced Crawler Settings</legend>
                    <SizeInput bind:value={formData.memoryLimit} label="Memory Limit"
                               tooltip="Memory limit in units M (Megabytes) or G (Gigabytes)."/>
                    <RegexInput bind:value={formData.includeRegex} label="Include Regex"
                                tooltip="Include only URLs matching at least one PCRE regex."/>
                    <RegexInput bind:value={formData.ignoreRegex} label="Ignore Regex"
                                tooltip="Ignore URLs matching any PCRE regex."/>
                    <RegexInput bind:value={formData.analyzerFilterRegex} label="Analyzer Filter Regex"
                                tooltip="Use only analyzers that match the specified regexp."/>
                    <ValInput bind:value={formData.acceptEncoding} label="Accept Encoding"
                              tooltip="Set `Accept-Encoding` request header."/>
                    <IntInput bind:value={formData.maxQueueLength} label="Max Queue Length"
                              tooltip="Max URL queue length."/>
                    <IntInput bind:value={formData.maxVisitedUrls} label="Max Visited URLs"
                              tooltip="Max visited URLs."/>
                    <IntInput bind:value={formData.maxUrlLength} label="Max URL Length"
                              tooltip="Max URL length in chars."/>
                    <CheckboxInput bind:checked={formData.removeQueryParams} label="Remove Query Parameters"
                                   tooltip="Remove URL query parameters from crawled URLs."/>
                    <CheckboxInput bind:checked={formData.addRandomQueryParams} label="Add Random Query Params"
                                   tooltip="Add random query parameters to each crawled URL."/>
                </fieldset>

                <!-- Expert settings -->
                <fieldset>
                    <legend>Expert Settings</legend>
                    <ValInput bind:value={formData.debugLogFile} label="Debug Log File"
                              tooltip="Log file where to save debug messages."/>
                    <RegexInput bind:value={formData.debugUrlRegex} label="Debug URL Regex"
                                tooltip="Regex for URL(s) to debug."/>
                    <SelectInput bind:value={formData.resultStorage} label="Result Storage Type"
                                 tooltip="Result storage type for content and headers." options={['memory', 'file']}/>
                    <DirInput bind:value={formData.resultStorageDir} label="Result Storage Directory"
                              tooltip="Directory for --result-storage=file."/>
                    <DirInput bind:value={formData.httpCacheDir} label="HTTP Cache Directory"
                              tooltip="Cache dir for HTTP responses."/>
                    <!--          <HostPortInput bind:value={formData.websocketServer} label="Websocket Server"-->
                    <!--                         tooltip="Start crawler with websocket server on given host:port."/>-->
                    <CheckboxInput bind:checked={formData.debug} label="Activate Debug Mode"
                                   tooltip="Activate debug mode."/>
                    <CheckboxInput bind:checked={formData.httpCacheCompression} label="Enable HTTP Cache Compression"
                                   tooltip="Enable compression for HTTP cache storage."/>
                    <CheckboxInput bind:checked={formData.resultStorageCompression}
                                   label="Enable Result Storage Compression"
                                   tooltip="Enable compression for results storage."/>
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

                <!-- Offline exporter options -->
                <fieldset>
                    <legend>Offline Exporter Options</legend>
                    <DirInput bind:value={formData.offlineExportDir} label="Offline Export Directory"
                              tooltip="Name of directory in user-data folder where to save the offline version of the website. E.g. `mydomain.tld`"/>
                    <RegexInput bind:value={formData.offlineExportStoreOnlyUrlRegex} label="Store Only URL Regex"
                                tooltip="For debug - store only URLs which match one of these PCRE regexes."/>
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

                <!-- Fastest URL analyzer -->
                <fieldset>
                    <legend>Fastest URL Analyzer</legend>
                    <IntInput bind:value={formData.fastestUrlsTopLimit} label="Top Limit for Fastest URLs"
                              tooltip="Number of URL addresses in TOP fastest URL addresses."/>
                    <ValInput bind:value={formData.fastestUrlsMaxTime} label="Max Time for Fastest URLs"
                              tooltip="The maximum response time for an URL address to be evaluated as fast."/>
                </fieldset>

                <!-- Slowest URL analyzer -->
                <fieldset>
                    <legend>Slowest URL Analyzer</legend>
                    <IntInput bind:value={formData.slowestUrlsTopLimit} label="Top Limit for Slowest URLs"
                              tooltip="Number of URL addresses in TOP slowest URL addresses."/>
                    <ValInput bind:value={formData.slowestUrlsMinTime} label="Min Time for Slowest URLs"
                              tooltip="The minimum response time for an URL address to be added to TOP slow selection."/>
                    <ValInput bind:value={formData.slowestUrlsMaxTime} label="Max Time for Slowest URLs"
                              tooltip="The maximum response time for an URL address to be evaluated as very slow."/>
                </fieldset>
            </div>
        </div>

        <div role="tabpanel" class="tab-content bg-base-100 pt-4 max-h-full h-full w-full"
             class:tab-content-active={activeTab === 'output'}>

            <div class="mockup-window border border-base-300 bg-base-300 max-h-full h-full w-full">
                <CrawlerMiniStats data={miniStatsData} fontFamily={consoleFontFamily} platform={osPlatform}/>
                <div id="terminal" class="terminal max-h-full h-full w-full" style="height: {terminalHeight}px; padding: 10px; background-color: #111;" bind:this={terminal}>

                </div>
<!--                <div id="terminal" class="terminal max-h-full h-full w-full" style="height: {terminalHeight}px">-->
<!--                    { consoleOutput ? consoleOutput : CRAWLER_IS_NOT_RUNNING}-->
<!--                </div>-->
            </div>
        </div>

        <div role="tabpanel" class="tab-content bg-base-100 pt-4 max-h-full h-full w-full gap-12" class:tab-content-active={activeTab === 'result'}>

            {#if reportBaseFilePath}
                <div role="alert" class="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-success shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span class="text-success">Crawling has been finished and your reports are generated.</span>
                    <div class="alert-buttons">
                        <a class="btn btn-active btn-primary" title="Open HTML report" aria-label="Open HTML label" on:click={() => openReportInBrowser('html')} target="_blank">HTML report</a>
                        <a class="btn btn-active btn-info" title="Open JSON report" aria-label="Open JSON label" on:click={() => openReportInBrowser('json')} target="_blank">JSON report</a>
                        <a class="btn btn-active btn-warning" title="Open TXT report" aria-label="Open TXT label" on:click={() => openReportInBrowser('txt')} target="_blank">TXT report</a>
                    </div>
                </div>
            {/if}

            {#if offlineWebsiteDir}
                <div role="alert" class="alert" style="margin-top: 14px; margin-bottom: 20px;">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-success shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span class="text-success">Offline website has been successfully generated.</span>
                    <div>
                        <a class="btn btn-active btn-secondary" title="Browse offline website" aria-label="Browse offline website" on:click={() => openOfflineVersion()} target="_blank">Browse offline website</a>
                    </div>
                </div>
            {/if}

            {#if sitemapXmlFile || sitemapTxtFile}
                <div role="alert" class="alert" style="margin-top: 14px; margin-bottom: 20px;">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-success shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span class="text-success">Sitemap has been successfully generated.</span>
                    <div>
                        {#if sitemapXmlFile}<a class="btn btn-active btn-neutral" title="Open Sitemap XML" aria-label="Open Sitemap XML" on:click={() => openSitemapXml()} target="_blank">Open sitemap.xml</a>{/if}
                        {#if sitemapTxtFile}<a class="btn btn-active btn-neutral" title="Open Sitemap TXT" aria-label="Open Sitemap TXT" on:click={() => openSitemapTxt()} target="_blank">Open sitemap.txt</a>{/if}
                    </div>
                </div>
            {/if}

            {#if reportBaseFilePath}
                <div style="margin-top: 12px; margin-left: 6px">
                  <h2 style="margin-top: 12px; font-size: 1.4em;">Manually browsing the output</h2>
                    <h3 style="font-size: 1em; margin: 24px 0;">All types of output are generated in the <a class="text-blue-500" on:click={() => openTmpDir()}>tmp folder</a> of the crawler. You can use the command below to move to this folder and view older reports, exports or delete the cache manually.</h3>
                </div>
                <div class="mockup-code" style="font-size: 0.8em;">
                    <pre><code class="text-warning" style="width: 100%; word-wrap: break-word">cd {reportBaseFilePath.replace(/[\/\\][^\/\\]+$/, '')}</code></pre>
                </div>

                <div style="margin-top: 20px; margin-left: 6px">
                  <h2 style="margin-top: 16px; margin-bottom: 12px; font-size: 1.4em;">Executed command</h2>
                  <h3 style="font-size: 1em; margin: 24px 0;">This graphical interface launched the command below of the <a href="https://crawler.siteone.io/getting-started/basic-usage/?utm_source=app-result-page&utm_medium={PLATFORM}&utm_campaign={ARCHITECTURE}&utm_content={VERSION}" class="text-blue-500" target="_blank">command-line part of the Crawler</a>.</h3>
                  <div class="mockup-code" style="font-size: 0.8em;">
                    <pre><code class="text-warning" style="width: 100%; word-wrap: break-word">./crawler
    {lastCliParams.join(" \\\n    ")}</code></pre>
                  </div>
                </div>
            {/if}

            {#if !reportBaseFilePath}
                <div role="alert" class="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Enter the URL above and start crawling to generate reports.</span>
                </div>
            {/if}

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

</style>
