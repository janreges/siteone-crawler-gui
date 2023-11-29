<script lang="ts">
  import InfoIcon from './InfoIcon.svelte';
  import type CrawlerFormContent from '../types/CrawlerFormContent';
  import { PLATFORM } from '../types/CrawlerInfo';
  import { onMount } from 'svelte';

  export let data:CrawlerFormContent;
  export let extraColumns: string[] = [];
  export let workersAlert: string | null = null;

  $: allowedDomainForCrawlingString = domainsToString(data.allowedDomainForCrawling);
  $: allowedDomainForExternalBoolean = (data.allowedDomainForExternalFiles.length === 1 && data.allowedDomainForExternalFiles[0] === '*');

  const extraColumnsOptions = {
    'Title': 'If enabled, adds the Title of the page to the URL table (in the console output and in the HTML report)',
    'Keywords': 'If enabled, adds the meta keywords of the page to the URL table (in the console output and in the HTML report)',
    'Description': 'If enabled, adds the meta Description of the page to the URL table (in the console output and in the HTML report)',
    'DOM': 'If enabled, adds the number of found DOM elements on the page to the URL table (in the console output and in the HTML report)'
  };

  function domainsToString(domainsArray:string[]): string {
    return domainsArray ? domainsArray.join(',') : '';
  }

  function stringToDomains(domainsString:string): string[] {
    return domainsString.split(',').map(domain => domain.trim());
  }

  function handleAllowedDomainForCrawlingChange(event) {
    data.allowedDomainForCrawling = stringToDomains(event.target.value);
  }

  function updateExtraColumns(option, enabled) {
    if (enabled) {
      extraColumns = extraColumns.filter(column => column !== option);
    } else {
      extraColumns.push(option);
    }
    data.extraColumns = extraColumns.join(',');
  }

</script>

<form class="p-4 basic-form basic-form">
  <div class="flex flex-wrap -mx-2">
    <fieldset class="w-full md:w-1/2 p-2 fieldset-basic-1">
      <legend class="font-bold text-gray-300">Performance and Limits</legend>
      <div class="form-control flex items-center">
        <label for="rTimeout" class="label" style="width: 180px">
          <span class="label-text">
            Timeout
            <InfoIcon tip="The maximum time in seconds to wait for a response from the server. If the server does not respond within this time, the request will be aborted." />
          </span>
        </label>
        <div class="flex-grow">
          <input id="rTimeout" type="range" class="range range-xs range-info" min="2" max="10" step="2" bind:value={data.timeout} />
          <div class="w-full flex justify-between text-xs px-2">
            <span>2</span>
            <span>4</span>
            <span>6</span>
            <span>8</span>
            <span>10</span>
          </div>
        </div>
      </div>
      <div class="form-control">
        <label for="rWorkers" class="label" style="width: 180px; min-width: 180px;">
          <span class="label-text">
            Concurrent Workers
            <InfoIcon tip="The maximum number of concurrent workers to use for crawling. Each worker will process one URL at a time. Be careful because with a high number of workers you can cause a DoS attack." />
          </span>
        </label>
        <div class="flex-grow">
          <input id="rWorkers" type="range" class="range range-xs range-error" min="1" max="5" step="1" bind:value={data.workers} />
          <div class="w-full flex justify-between text-xs px-2">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          {#if data.workers > 1 && PLATFORM === 'Windows'}
            <div role="alert" class="alert alert-warning" style="display: flex; padding: 2px 6px; gap: 0.2em; font-size: 0.7em; border-radius: 8px; margin-top: 10px;">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>Warning: On Windows, if you use more than 1 worker, there may be a crash and the need to repeat crawling. We will fix it in the future.</span>
            </div>
          {/if}
        </div>
      </div>
      <div class="form-control">
        <label for="rRps" class="label" style="width: 180px">
          <span class="label-text">
            Max Requests/s
            <InfoIcon tip="The maximum number of requests per second to send to the server by all workers. Be careful because with a high number of requests per second you can cause a DoS attack." />
          </span>
        </label>
        <div class="flex-grow">
          <input id="rRps" type="range" class="range range-xs range-secondary" min="5" max="25" step="5" bind:value={data.maxReqsPerSec} />
          <div class="w-full flex justify-between text-xs px-2">
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
            <span>25</span>
          </div>
        </div>
      </div>
      <div class="form-control">
        <label for="rUrls" class="label" style="width: 180px">
          <span class="label-text">
            Max Visited URLs
            <InfoIcon tip="The maximum number of URLs to visit. If the crawler reaches this limit, it will stop crawling. It is useful for testing the functionality only on a small part of the site." />
          </span>
        </label>
        <div class="flex-grow">
          <input id="rUrls" type="range" class="range range-xs range-info" min="100" max="10100" step="2000" bind:value={data.maxVisitedUrls} />
          <div class="w-full flex justify-between text-xs px-2">
            <span>100</span>
            <span>2100</span>
            <span>4100</span>
            <span>6100</span>
            <span>8100</span>
            <span>10100</span>
          </div>
        </div>
      </div>
    </fieldset>

    <div class="checkboxes-part w-full md:w-1/2 flex">
      <fieldset class="w-full md:w-1/2 p-2">
        <legend class="font-bold text-gray-300">Content Settings</legend>
        <div class="form-control form-control-checkbox">
          <input id="chkALlowJs" type="checkbox" class="checkbox checkbox-info" checked={!data.disableJavascript} on:change={(event) => data.disableJavascript = !event.currentTarget.checked} />
          <label class="label" for="chkALlowJs">
            <span class="label-text">
              Allow JavaScript
              <InfoIcon tip="If enabled, the crawler will download JavaScript files. If JavaScript is disabled, the generated offline version will also have JavaScript completely removed, including inline JavaScript." position="right" />
            </span>
          </label>
        </div>
        <div class="form-control form-control-checkbox">
          <input id="chkAllowCss" type="checkbox" class="checkbox checkbox-info" checked={!data.disableStyles} on:change={(event) => data.disableStyles = !event.currentTarget.checked} />
          <label class="label" for="chkAllowCss">
            <span class="label-text">
              Allow CSS
              <InfoIcon tip="If enabled, the crawler will download CSS files and will extract the URLs of the static files (images, fonts) from the CSS files. If CSS is disabled, the generated offline version will also have CSS completely removed, inline styles included." position="right" />
            </span>
          </label>
        </div>
        <div class="form-control form-control-checkbox">
          <input id="chkAllowFonts" type="checkbox" class="checkbox checkbox-info" checked={!data.disableFonts} on:change={(event) => data.disableFonts = !event.currentTarget.checked} />
          <label for="chkAllowFonts" class="label">
            <span class="label-text">
              Allow Fonts
              <InfoIcon tip="If enabled, the crawler will download all found font files in HTML or CSS." position="right" />
            </span>
          </label>
        </div>
        <div class="form-control form-control-checkbox">
          <input id="chkAllowImages" type="checkbox" class="checkbox checkbox-info" checked={!data.disableImages} on:change={(event) => data.disableImages = !event.currentTarget.checked} />
          <label for="chkAllowImages" class="label">
            <span class="label-text">
              Allow Images
              <InfoIcon tip="If enabled, the crawler will download image files, including images from all srcset attributes. If not, the generated offline version will only show placeholders instead of the original images." position="right" />
            </span>
          </label>
        </div>
        <div class="form-control form-control-checkbox">
          <input id="chkAllowFiles" type="checkbox" class="checkbox checkbox-info" checked={!data.disableFiles} on:change={(event) => data.disableFiles = !event.currentTarget.checked} />
          <label for="chkAllowFiles" class="label">
            <span class="label-text">
              Allow Files
              <InfoIcon tip="If enabled, the crawler will download any other files (pdf, doc, etc.) that are linked from the HTML pages. All these files will be part of the offline version." position="right" />
            </span>
          </label>
        </div>
      </fieldset>
      <fieldset class="w-full md:w-1/2 p-2">
        <legend class="font-bold text-gray-300">Generators</legend>
        <div class="form-control form-control-checkbox">
          <input id="chkOffline" type="checkbox" class="checkbox checkbox-info" checked={data.offlineExportDirectory !== null} on:change={(event) => (data.offlineExportDirectory = event.currentTarget.checked ? 'tmp/'+data.getDomainFromUrl() : null)} />
          <label for="chkOffline" class="label">
            <span class="label-text">
              Generate offline website
              <InfoIcon tip="If enabled, the crawler will generate a static website that can be opened in a browser without an internet connection." position="left" />
            </span>
          </label>
        </div>
        <div class="form-control form-control-checkbox">
          <input
            id="chkSitemap"
            type="checkbox"
            class="checkbox checkbox-info"
            checked={data.sitemapXmlFile !== null}
            on:change={(event) => {
              data.sitemapXmlFile = event.currentTarget.checked ? 'tmp/'+data.getDomainFromUrl()+'.sitemap.xml' : null;
              data.sitemapTxtFile = event.currentTarget.checked ? 'tmp/'+data.getDomainFromUrl()+'.sitemap.txt' : null;
            }} />
          <label for="chkSitemap" class="label">
            <span class="label-text">
              Generate sitemap
              <InfoIcon tip="If enabled, the crawler will generate a sitemap.xml and sitemap.txt file that can be submitted to search engines or hosted on your website." position="left" />
            </span>
          </label>
        </div>
      </fieldset>
    </div>

    <fieldset class="w-full md:w-1/2 p-2">
      <legend class="font-bold text-gray-300">Caching and Optimization</legend>
      <div class="form-control form-control-checkbox">
        <label for="chCache" class="label" style="width: 180px; padding-left: 4px;">
          <span class="label-text">
            Request caching
            <InfoIcon tip="If enabled, the crawler will cache the downloaded files and will not download them again. The files are saved to disk." />
          </span>

        </label>
        <input
          id="chCache"
          type="checkbox"
          class="checkbox checkbox-info"
          checked={data.httpCacheDir === null}
          on:change={(event) => {
              data.httpCacheDir = event.currentTarget.checked ? null : '';
            }}
        />
      </div>
      <div class="form-control form-control-radios" style="display: flex; align-items: baseline;">
        <label for="radioCacheStorageMemory" class="label" style="width: 180px;">
          <span class="label-text">
            Internal data storage
            <InfoIcon tip="The storage to use for storing internal data/stats. The default is memory. If you have a large number of URLs to crawl, you can use the disk storage to avoid running out of memory." />
          </span>
        </label>
        <div class="radios">
          <input
            id="radioCacheStorageMemory"
            type="radio"
            name="radio-cache-storage"
            class="radio radio-info"
            value="memory"
            checked={data.resultStorage === 'memory'}
            on:change={() => data.resultStorage = 'memory'}
          />
          <label for="radioCacheStorageMemory" class="radio-label">Memory</label>
          <input
            id="radioCacheStorageDisk"
            type="radio"
            name="radio-cache-storage"
            class="radio radio-info"
            value="file"
            checked={data.resultStorage === 'file'}
            on:change={() => data.resultStorage = 'file'}
          />
          <label for="radioCacheStorageDisk" class="radio-label">Disk</label>
        </div>
      </div>
    </fieldset>

    <fieldset class="w-full md:w-1/2 p-2">
      <legend class="font-bold text-gray-300">Extra Columns</legend>

      <div class="flex flex-wrap w-full">
        {#each Object.entries(extraColumnsOptions) as [option, tip]}
          <div class="form-control form-control-checkbox w-full md:w-1/2">
            <input
              id="chk{option}"
              type="checkbox"
              class="checkbox checkbox-info"
              checked={data.extraColumns.includes(option)}
              on:change={() => updateExtraColumns(option, extraColumns.includes(option))}
            />
            <label class="label" for="chk{option}">
              <span class="label-text">
                {option}
                <InfoIcon {tip} position="left" />
              </span>
            </label>
          </div>
        {/each}
      </div>
    </fieldset>

    <fieldset class="w-full md:w-1/2 p-2">
      <legend class="font-bold text-gray-300">Scope and Restrictions</legend>
      <div class="form-control form-control-checkbox">
        <label for="chDomainStaticFiles" class="label" style="width: 180px; padding-left: 4px;">
          <span class="label-text">
            Any domain for assets
            <InfoIcon tip="If enabled, the crawler will download static files (images, fonts, styles, scripts, etc.) from any domain. If disabled, the crawler will only download static files from the same domain as the starting URL." />
          </span>
        </label>
        <input id="chDomainStaticFiles"
               type="checkbox"
               class="checkbox checkbox-info"
               checked={allowedDomainForExternalBoolean}
               on:change={() => data.allowedDomainForExternalFiles = allowedDomainForExternalBoolean ? ['*'] : []}
        />
      </div>
      <div class="form-control">
        <label for="chDomainsForCrawling" class="label" style="width: 184px;">
          <span class="label-text">
            Extra crawled domains
            <InfoIcon tip="A comma-separated list of domains that the crawler is allowed to crawl. You can use '*', e.g. *.mydomain.tld." />
          </span>
        </label>
        <input
          id="chDomainsForCrawling"
          type="text"
          class="input input-bordered input-sm"
          style="margin-top: 0.25rem;"
          value={allowedDomainForCrawlingString}
          on:input={handleAllowedDomainForCrawlingChange}
        />
      </div>
    </fieldset>

  </div>
</form>
