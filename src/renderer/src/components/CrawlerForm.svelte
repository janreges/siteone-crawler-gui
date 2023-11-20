<script lang="ts">
  import ValInput from './form/ValInput.svelte';
  import FileInput from './form/FileInput.svelte';
  import IntInput from './form/IntInput.svelte';
  import UrlInput from './form/UrlInput.svelte';
  import HostPortInput from './form/HostPortInput.svelte';
  import SizeInput from './form/SizeInput.svelte';
  import RegexInput from './form/RegexInput.svelte';
  import DirInput from './form/DirInput.svelte';
  import EmailInput from './form/EmailInput.svelte';
  import SelectInput from './form/SelectInput.svelte';
  import CheckboxInput from './form/CheckboxInput.svelte';
  import CrawlerFormContent from '../types/CrawlerFormContent';
  import PasswordInput from './form/PasswordInput.svelte';
  import type { CrawlerMessage } from '../../../main/crawler/CrawlerMessage';
  import { CrawlerMessageType } from '../../../main/crawler/CrawlerMessage';

  export let formData: CrawlerFormContent = null;
  if (formData === null) {
    formData = new CrawlerFormContent();
  }

  const c: (event: any, message: CrawlerMessage) => void = function(_event, message) {
    console.log('Crawler message:');
    console.log(message);
  };

  const onSubmit = function(): void {
    formData.cliParams = formData.generateCliParams();
    window.api.setMessageToBackend({ type: CrawlerMessageType.START, data: formData });
  };

  window.api.onCrawlerMessage(c);

</script>

<form>
  <!-- URL -->
  <fieldset class="url">
    <legend>URL</legend>
    <UrlInput bind:value={formData.url} label="URL"
              tooltip="Required URL. Enclose in quotes if URL contains query parameters." />
    <button type="button" on:click={onSubmit}>Run</button>
  </fieldset>
  <div class="fieldset-container">
    <!-- Basic settings -->
    <fieldset>
      <legend>Basic Settings</legend>
      <SelectInput bind:value={formData.device} label="Device Type" tooltip="Device type for User-Agent selection."
                   options={['desktop', 'tablet', 'mobile']} />
      <ValInput bind:value={formData.userAgent} label="User Agent"
                tooltip="Override User-Agent selected by --device." />
      <IntInput bind:value={formData.timeout} label="Timeout" tooltip="Request timeout (in sec)." />
      <HostPortInput bind:value={formData.proxy} label="Proxy" tooltip="HTTP proxy in `host:port` format." />
      <ValInput bind:value={formData.httpAuth} label="HTTP Auth"
                tooltip="Basic HTTP authentication in `username:password` format." />
    </fieldset>

    <!-- Output settings -->
    <fieldset>
      <legend>Output Settings</legend>
      <SelectInput bind:value={formData.output} label="Output Type" tooltip="Output type `text` or `json`."
                   options={['text', 'json']} />
      <ValInput bind:value={formData.extraColumns} label="Extra Columns"
                tooltip="Extra table headers for output table, e.g., `DOM,X-Cache(10),Title(40>)`." />
      <IntInput bind:value={formData.urlColumnSize} label="URL Column Size" tooltip="URL column width." />
      <CheckboxInput bind:checked={formData.showInlineCriticals} label="Show Inline Criticals"
                     tooltip="Show criticals from the analyzer directly in the URL table." />
      <CheckboxInput bind:checked={formData.showInlineWarnings} label="Show Inline Warnings"
                     tooltip="Show warnings from the analyzer directly in the URL table." />
      <CheckboxInput bind:checked={formData.doNotTruncateUrl} label="Do Not Truncate URL"
                     tooltip="Avoid truncating URLs to `--url-column-size`." />
      <CheckboxInput bind:checked={formData.showSchemeAndHost} label="Show Scheme and Host"
                     tooltip="Show the schema://host also of the original domain URL as well." />
      <CheckboxInput bind:checked={formData.hideProgressBar} label="Hide Progress Bar"
                     tooltip="Suppress progress bar in output." />
      <CheckboxInput bind:checked={formData.noColor} label="Disable Colored Output" tooltip="Disable colored output." />
    </fieldset>

    <!-- Resource filtering -->
    <fieldset>
      <legend>Resource Filtering</legend>
      <CheckboxInput bind:checked={formData.disableJavascript} label="Disable JavaScript"
                     tooltip="Disables JavaScript downloading and removes all JavaScript code from HTML." />
      <CheckboxInput bind:checked={formData.disableStyles} label="Disable Styles"
                     tooltip="Disables CSS file downloading and removes all style definitions." />
      <CheckboxInput bind:checked={formData.disableFonts} label="Disable Fonts"
                     tooltip="Disables font downloading and also removes all font/font-face definitions from CSS." />
      <CheckboxInput bind:checked={formData.disableImages} label="Disable Images"
                     tooltip="Disables downloading of all images and replaces found images in HTML with placeholder image only." />
      <CheckboxInput bind:checked={formData.disableFiles} label="Disable Files"
                     tooltip="Disables downloading of any files (typically downloadable documents) to which various links point." />
      <CheckboxInput bind:checked={formData.removeAllAnchorListeners} label="Remove All Anchor Listeners"
                     tooltip="On all links on the page remove any event listeners." />
    </fieldset>

    <!-- Advanced crawler settings -->
    <fieldset>
      <legend>Advanced Crawler Settings</legend>
      <IntInput bind:value={formData.workers} label="Max Concurrent Workers"
                tooltip="Max concurrent workers (threads)." />
      <ValInput bind:value={formData.maxReqsPerSec} label="Max Requests Per Second"
                tooltip="Max requests/s for whole crawler." />
      <SizeInput bind:value={formData.memoryLimit} label="Memory Limit"
                 tooltip="Memory limit in units M (Megabytes) or G (Gigabytes)." />
      <ValInput bind:value={formData.allowedDomainForExternalFiles} label="Allowed Domain for Ext. Files"
                tooltip="Allows loading of file content from another domain as well." />
      <ValInput bind:value={formData.allowedDomainForCrawling} label="Allowed Domain for Crawling"
                tooltip="Allows crawling of all content from other listed domains." />
      <RegexInput bind:value={formData.includeRegex} label="Include Regex"
                  tooltip="Include only URLs matching at least one PCRE regex." />
      <RegexInput bind:value={formData.ignoreRegex} label="Ignore Regex"
                  tooltip="Ignore URLs matching any PCRE regex." />
      <RegexInput bind:value={formData.analyzerFilterRegex} label="Analyzer Filter Regex"
                  tooltip="Use only analyzers that match the specified regexp." />
      <ValInput bind:value={formData.acceptEncoding} label="Accept Encoding"
                tooltip="Set `Accept-Encoding` request header." />
      <CheckboxInput bind:checked={formData.removeQueryParams} label="Remove Query Parameters"
                     tooltip="Remove URL query parameters from crawled URLs." />
      <CheckboxInput bind:checked={formData.addRandomQueryParams} label="Add Random Query Params"
                     tooltip="Add random query parameters to each crawled URL." />
      <IntInput bind:value={formData.maxQueueLength} label="Max Queue Length" tooltip="Max URL queue length." />
      <IntInput bind:value={formData.maxVisitedUrls} label="Max Visited URLs" tooltip="Max visited URLs." />
      <IntInput bind:value={formData.maxUrlLength} label="Max URL Length" tooltip="Max URL length in chars." />
    </fieldset>

    <!-- Expert settings -->
    <fieldset>
      <legend>Expert Settings</legend>
      <ValInput bind:value={formData.debugLogFile} label="Debug Log File"
                tooltip="Log file where to save debug messages." />
      <RegexInput bind:value={formData.debugUrlRegex} label="Debug URL Regex" tooltip="Regex for URL(s) to debug." />
      <SelectInput bind:value={formData.resultStorage} label="Result Storage Type"
                   tooltip="Result storage type for content and headers." options={['memory', 'file']} />
      <DirInput bind:value={formData.resultStorageDir} label="Result Storage Directory"
                tooltip="Directory for --result-storage=file." />
      <DirInput bind:value={formData.httpCacheDir} label="HTTP Cache Directory"
                tooltip="Cache dir for HTTP responses." />
      <HostPortInput bind:value={formData.websocketServer} label="Websocket Server"
                     tooltip="Start crawler with websocket server on given host:port." />
      <CheckboxInput bind:checked={formData.debug} label="Activate Debug Mode" tooltip="Activate debug mode." />
      <CheckboxInput bind:checked={formData.httpCacheCompression} label="Enable HTTP Cache Compression"
                     tooltip="Enable compression for HTTP cache storage." />
      <CheckboxInput bind:checked={formData.resultStorageCompression} label="Enable Result Storage Compression"
                     tooltip="Enable compression for results storage." />
    </fieldset>

    <!-- File export settings -->
    <fieldset>
      <legend>File Export Settings</legend>
      <FileInput bind:value={formData.outputHtmlReport} label="Output HTML Report"
                 tooltip="Save HTML report into that file." />
      <FileInput bind:value={formData.outputJsonFile} label="Output JSON File" tooltip="Save report as JSON." />
      <FileInput bind:value={formData.outputTextFile} label="Output Text File" tooltip="Save output as TXT." />
      <CheckboxInput bind:checked={formData.addHostToOutputFile} label="Add Host to Output File"
                     tooltip="Append initial URL host to filename except sitemaps." />
      <CheckboxInput bind:checked={formData.addTimestampToOutputFile} label="Add Timestamp to Output File"
                     tooltip="Append timestamp to filename except sitemaps." />
    </fieldset>

    <!-- Mailer options -->
    <fieldset>
      <legend>Mailer Options</legend>
      <EmailInput bind:value={formData.mailTo} label="E-mail To" tooltip="E-mail report recipient address(es)." />
      <EmailInput bind:value={formData.mailFrom} label="E-mail From" tooltip="E-mail sender address." />
      <ValInput bind:value={formData.mailFromName} label="E-mail From Name" tooltip="E-mail sender name." />
      <ValInput bind:value={formData.mailSubjectTemplate} label="Mail Subject Template"
                tooltip="E-mail subject template. You can use dynamic variables %domain% and %datetime%." />
      <ValInput bind:value={formData.mailSmtpHost} label="SMTP Host" tooltip="SMTP host." />
      <IntInput bind:value={formData.mailSmtpPort} label="SMTP Port" tooltip="SMTP port." />
      <ValInput bind:value={formData.mailSmtpUser} label="SMTP User" tooltip="SMTP user for authentication." />
      <PasswordInput bind:value={formData.mailSmtpPass} label="SMTP Password"
                     tooltip="SMTP password for authentication." />
    </fieldset>

    <!-- Offline exporter options -->
    <fieldset>
      <legend>Offline Exporter Options</legend>
      <DirInput bind:value={formData.offlineExportDirectory} label="Offline Export Directory"
                tooltip="Path to directory where to save the offline version of the website." />
      <RegexInput bind:value={formData.offlineExportStoreOnlyUrlRegex} label="Store Only URL Regex"
                  tooltip="For debug - store only URLs which match one of these PCRE regexes." />
    </fieldset>

    <!-- Sitemap options -->
    <fieldset>
      <legend>Sitemap Options</legend>
      <FileInput bind:value={formData.sitemapXmlFile} label="Sitemap XML File"
                 tooltip="Save sitemap to XML file. '.xml' added if missing." />
      <FileInput bind:value={formData.sitemapTxtFile} label="Sitemap TXT File"
                 tooltip="Save sitemap to TXT file. '.txt' added if missing." />
      <ValInput bind:value={formData.sitemapBasePriority} label="Sitemap Base Priority"
                tooltip="Base priority for XML sitemap. Default value is `0.5`." />
      <ValInput bind:value={formData.sitemapPriorityIncrease} label="Sitemap Priority Increase"
                tooltip="Priority increase value based on slashes count in the URL. Default value is `0.1`." />
    </fieldset>

    <!-- SEO and OpenGraph analyzer -->
    <fieldset>
      <legend>SEO and OpenGraph Analyzer</legend>
      <IntInput bind:value={formData.maxHeadingLevel} label="Maximal Heading Level"
                tooltip="Maximal analyzer heading level from 1 to 6." />
    </fieldset>

    <!-- Fastest URL analyzer -->
    <fieldset>
      <legend>Fastest URL Analyzer</legend>
      <IntInput bind:value={formData.fastestUrlsTopLimit} label="Top Limit for Fastest URLs"
                tooltip="Number of URL addresses in TOP fastest URL addresses." />
      <ValInput bind:value={formData.fastestUrlsMaxTime} label="Max Time for Fastest URLs"
                tooltip="The maximum response time for an URL address to be evaluated as fast." />
    </fieldset>

    <!-- Slowest URL analyzer -->
    <fieldset>
      <legend>Slowest URL Analyzer</legend>
      <IntInput bind:value={formData.slowestUrlsTopLimit} label="Top Limit for Slowest URLs"
                tooltip="Number of URL addresses in TOP slowest URL addresses." />
      <ValInput bind:value={formData.slowestUrlsMinTime} label="Min Time for Slowest URLs"
                tooltip="The minimum response time for an URL address to be added to TOP slow selection." />
      <ValInput bind:value={formData.slowestUrlsMaxTime} label="Max Time for Slowest URLs"
                tooltip="The maximum response time for an URL address to be evaluated as very slow." />
    </fieldset>
  </div>
</form>

<style>
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
        border: 1px solid var(--main-input-bg-color);
        border-radius: 4px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        flex: 1;
        min-width: 300px; /* Zvětšení minimální šířky */
    }

    fieldset.url {
        display: block !important;
        width: 100% !important;
    }

    legend {
        padding: 0 10px;
        width: auto;
        margin-left: 6px;
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
        min-width: 148px;
        font-size: 11px;
    }

    :global(input:focus),
    :global(textarea:focus),
    :global(select:focus),
    :global(a:focus) {
        outline: none;
    }

    :global(input[type="text"]),
    :global(input[type="number"]),
    :global(input[type="email"]),
    :global(select) {
        padding: 3px;
        border: 1px solid var(--main-input-border-color);
        border-radius: 4px;
        flex-grow: 1;
        font-size: 11px;
        background-color: var(--main-input-bg-color);
        color: var(--main-link-color);
        cursor: help;
    }

    :global(input[type="number"]) {
        max-width: 50px; /* Zmenšení šířky IntInput */
        flex-grow: 0; /* Zabrání roztažení */
    }

    :global(.form-group .error) {
        color: red;
        font-size: 10px;
        line-height: 11px;
    }

    /* Responzivní úpravy */
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
        :global(select) {
            width: 100%;
        }

        :global(input[type="number"]) {
            max-width: 100%;
        }
    }
</style>
