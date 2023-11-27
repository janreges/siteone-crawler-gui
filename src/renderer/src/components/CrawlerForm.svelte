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

    let terminal;
    var term;
    onMount(async () => {
        const osPlatform = window.api.getPlatform();
        const defaultFont = osPlatform ? (osPlatform === 'win32' ? 'Consolas' : (osPlatform === 'darwin' ? 'SF Mono' : 'DejaVu Sans Mono')) : 'monospace';
        console.log(defaultFont);
        term = new Terminal({
            fontSize: 12,
            fontFamily: defaultFont,
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
        term.writeln('Hello from SiteOne Crawler!');
    });


    // const CRAWLER_IS_NOT_RUNNING = 'Crawler is not running...';
    const CRAWLER_IS_STARTING = 'Crawler is starting...';
    const CRAWLER_STOPPED = 'Crawler stopped.';

    export const STATE_NOT_RUNNING = 'not-running';
    export const STATE_RUNNING = 'running';
    export const STATE_STOPPING = 'stopping';

    let formState: string = STATE_NOT_RUNNING;
    let hasResult: boolean = false;
    let historyStorage:HistoryStorage = new HistoryStorage();

    export let formData: CrawlerFormContent = null;

    export let windowWidth: number;
    export let windowHeight: number;
    let reportBaseFilePath: string | null = null;
    let offlineWebsiteDir: string | null = null;

    let basicFormPartHeight: number = 0;
    $: terminalWidth = windowWidth - 20;
    $: terminalHeight = windowHeight - basicFormPartHeight - 140;

    let activeTab: string = 'setup';

    if (formData === null) {
        formData = new CrawlerFormContent();
    }

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
                break;

            case CrawlerMessageType.STDOUT_DATA:
                let lines = message.data.message.trim().split(/\r?\n/);
                lines.map(async (line) => {
                    if (line && line.includes('HTML report saved')) {
                        const pathDelimiter = window.api.getPlatform() === 'win32' ? '\\' : '/';
                        reportBaseFilePath = await window.api.getTmpDir() + pathDelimiter + getReportBaseName(line);
                        setTimeout(() => activeTab = 'result', 1000);
                    } else if (line && line.includes('Offline website generated to')) {
                        const pathDelimiter = window.api.getPlatform() === 'win32' ? '\\' : '/';
                        offlineWebsiteDir = await window.api.getTmpDir() + pathDelimiter + getOfflineVersionBaseName(line);
                        setTimeout(() => activeTab = 'result', 1000);
                    }
                    term.writeln(line);
                });
                break;
        }
    };

    const onRun = function (): void {
        activeTab = 'output';
        formState = STATE_RUNNING;
        reportBaseFilePath = null;
        offlineWebsiteDir = null;

        formData.consoleWidth = getTerminalCols();
        formData.cliParams = formData.generateCliParams();

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
        return Math.floor(terminalHeight / 15);
    }

    export function handleResize(): void {
        setTimeout(() => term.resize(getTerminalCols(), getTerminalRows()), 50);
    }

    function getReportBaseName(text: string): string | null {
        const regex = /HTML report saved to '([^']+)'/;
        const match = text.match(regex);
        if (match && match[1]) {
            const fullPath = match[1].replace('.html', '');
            const pathSegments = fullPath.split('/');
            return pathSegments[pathSegments.length - 1];
        }
        return null;
    }

    function getOfflineVersionBaseName(text: string): string | null {
        const regex = /Offline website generated to '([^']+)'/;
        const match = text.match(regex);
        if (match && match[1]) {
            const fullPath = match[1];
            const pathSegments = fullPath.split('/');
            return pathSegments[pathSegments.length - 1];
        }
        return null;
    }

    function openReportInBrowser(extension:string): void {
        window.api.openExternal('file://' + getReportFilePath(extension));
    }

    function openOfflineVersion():void {
        window.api.openExternal('file://' + offlineWebsiteDir + '/index.html');
    }

    function getReportFilePath(extension:string): string {
        let result = reportBaseFilePath + '.' + extension;
        if (extension === 'json' || extension === 'txt') {
            result = result.replace('report.', 'output.');
        }
        return result;
    }

    window.api.onCrawlerMessage(crawlerMessageHandler);

</script>

<form class="max-h-screen h-screen w-full">
    <!-- URL -->

    <div>
        <BasicFormPart bind:value={formData.url} bind:containerDivHeight={basicFormPartHeight} on:run={onRun} on:stop={onStop} label="URL"
                       on:loadFromHistory={handleLoadFromHistory} {historyStorage} bind:htmlReportFilePath={reportBaseFilePath}
                       {formState} tooltip="Required URL. Enclose in quotes if URL contains query parameters."/>
    </div>
    <div role="tablist" class="tabs tabs-bordered">
        <a role="tab" class="tab font-semibold" class:tab-active={activeTab === 'setup'}
           on:click={() => activeTab = 'setup'}>Setup</a>
        <a role="tab" class="tab font-semibold" class:tab-active={activeTab === 'output'}
           on:click={() => activeTab = 'output'}>Output</a>
        <a role="tab" class="tab font-semibold" class:tab-active={activeTab === 'result'}
           class:tab-disabled={!hasResult} on:click={() => hasResult ? (activeTab = 'result') : null}>Result</a>

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
                    <ValInput bind:value={formData.allowedDomainForExternalFiles} label="Allowed Domain for Ext. Files"
                              tooltip="Allows loading of file content from another domain as well."/>
                    <ValInput bind:value={formData.allowedDomainForCrawling} label="Allowed Domain for Crawling"
                              tooltip="Allows crawling of all content from other listed domains."/>
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
                    <DirInput bind:value={formData.offlineExportDirectory} label="Offline Export Directory" placeholder="tmp/yourdomain.com"
                              tooltip="Path to directory where to save the offline version of the website. Required to set `tmp/*`, e.g. `tmp/yourdomain.com`"/>
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

                <div id="terminal" class="terminal max-h-full h-full w-full" style="height: {terminalHeight}px; padding: 10px; background-color: #111;" bind:this={terminal}>

                </div>
<!--                <div id="terminal" class="terminal max-h-full h-full w-full" style="height: {terminalHeight}px">-->
<!--                    { consoleOutput ? consoleOutput : CRAWLER_IS_NOT_RUNNING}-->
<!--                </div>-->
            </div>
        </div>

        <div role="tabpanel" class="tab-content bg-base-100 pt-4 max-h-full h-full w-full gap-12"
             class:tab-content-active={activeTab === 'result'}>

            {#if offlineWebsiteDir}
                <div role="alert" class="alert alert-success" style="margin-bottom: 20px;">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Congrats! Offline website has been successfully generated.</span>
                    <div>
                        <a class="btn btn-active btn-primary" href="#" on:click={() => openOfflineVersion()}>Browse offline website</a>
                    </div>
                </div>
            {/if}

            {#if reportBaseFilePath}
                <div role="alert" class="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-success shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span class="text-success">Crawling has been finished and your reports are generated:</span>
                    <div>
                        <a class="btn btn-active btn-success" href="#" on:click={() => openReportInBrowser('html')}>HTML report</a>
                        <a class="btn btn-active btn-info" href="#" on:click={() => openReportInBrowser('json')}>JSON report</a>
                        <a class="btn btn-active btn-warning" href="#" on:click={() => openReportInBrowser('txt')}>TXT report</a>
                    </div>
                </div>

                <h2 style="font-size: 1em; margin: 24px 0;">... or manually go to the temporary folder and view older reports as well:</h2>

                <div class="mockup-code" style="font-size: 0.8em;">
                    <pre data-prefix="$"><code class="text-warning">cd {reportBaseFilePath.replace(/[\/\\][^\/\\]+$/, '')}</code></pre>
                </div>
            {:else}
                <div role="alert" class="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Enter the URL above and start crawling to generate reports.</span>
                </div>
            {/if}

        </div>
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
        color: rgb(59 130 246);
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
/*
    .terminal :global(h1), .terminal :global(h2), .terminal :global(h3), .terminal :global(h4), .terminal :global(h5), .terminal :global(h6) {
        all: unset;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        line-height: 12px;
    }

    .terminal {
        width: 100%;
        height: 100%;
        background-color: #000000;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        padding: 10px;
        border-radius: 5px;
        line-height: 12px;
        white-space: pre-wrap;
        overflow-x: auto;
        overflow-y: scroll;
        overflow-anchor: auto;
    }

 */

    :global(.checkbox) {
        border-radius: 2px !important;
    }

</style>
