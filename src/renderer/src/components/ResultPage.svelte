<script lang="ts">
  export let reportBaseFilePath: string | null = null;
  export let offlineWebsiteDir: string | null = null;
  export let markdownWebsiteDir: string | null = null;
  export let markdownSingleFile: string | null = null;
  export let sitemapXmlFile: string | null = null;
  export let sitemapTxtFile: string | null = null;
  export let htmlReportUrl: string | null = null;
  export let lastCliParams: string[] = [];
  
  let htmlReportUrlCopyText: string | null = null;
  let commandCopyText: string | null = null;
  
  function openReportInBrowser(extension: string): void {
    window.api.openExternal('file://' + getReportFilePath(extension));
  }
  
  function openOnlineHtmlReport(): void {
    window.api.openExternal(htmlReportUrl);
  }
  
  function openOfflineExport(): void {
    window.api.openExternal('file://' + offlineWebsiteDir + '/index.html');
  }
  
  function openMarkdownExport(): void {
    window.api.openExternal('file://' + markdownWebsiteDir + '/');
  }
  
  function openMarkdownSingleFile(): void {
    window.api.openExternal('file://' + markdownSingleFile);
  }
  
  function openSitemapXml(): void {
    window.api.openExternal('file://' + sitemapXmlFile);
  }
  
  function openSitemapTxt(): void {
    window.api.openExternal('file://' + sitemapTxtFile);
  }
  
  async function openTmpDir(): Promise<void> {
    window.api.openExternal('file://' + await window.api.getTmpDir());
  }
  
  function copyOnlineReportUrl() {
    navigator.clipboard.writeText(htmlReportUrl).then(() => {
      htmlReportUrlCopyText = 'Copied!';
      setTimeout(() => htmlReportUrlCopyText = null, 2000);
    }).catch(err => {
      htmlReportUrlCopyText = 'Error: ' + err.message;
    });
  }
  
  function getReportFilePath(extension: string): string {
    let result = reportBaseFilePath + '.' + extension;
    if (extension === 'json' || extension === 'txt') {
      result = result.replace('report.', 'output.');
    }
    return result;
  }
  
  function copyCommand() {
    const command = `./crawler\n    ${lastCliParams.join(" \\\n    ")}`;
    navigator.clipboard.writeText(command).then(() => {
      commandCopyText = 'Copied!';
      setTimeout(() => commandCopyText = null, 2000);
    });
  }
  
  $: hasReports = reportBaseFilePath || htmlReportUrl || offlineWebsiteDir || markdownWebsiteDir || sitemapXmlFile || sitemapTxtFile;
</script>

<div class="result-container compact">
  {#if hasReports}
    <!-- Compact Success Header -->
    <div class="alert alert-success mb-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="font-semibold">Crawling completed successfully. Your reports are ready.</span>
    </div>

    <!-- Two Column Layout - Left wider than right -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
      
      <!-- Left Column - Primary Reports (2/3 width) -->
      <div class="lg:col-span-2 space-y-3">
        
        <!-- Primary Reports (Always visible) -->
        {#if reportBaseFilePath}
        <div class="card card-compact bg-base-200">
          <div class="card-body">
            <h3 class="card-title text-base flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generated Reports
            </h3>
            <div class="flex flex-wrap gap-2 mt-2">
              <button type="button" class="btn btn-sm btn-info px-3" on:click={() => openReportInBrowser('html')}>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                HTML Report
              </button>
              <button type="button" class="btn btn-sm bg-base-300 hover:bg-base-content/20 border-0 px-3" on:click={() => openReportInBrowser('json')}>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                JSON Data
              </button>
              <button type="button" class="btn btn-sm bg-base-300 hover:bg-base-content/20 border-0 px-3" on:click={() => openReportInBrowser('txt')}>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Text Output
              </button>
            </div>
          </div>
        </div>
        {/if}

        <!-- Online Report -->
        {#if htmlReportUrl}
        <div class="card card-compact bg-base-200 border border-success/30">
          <div class="card-body">
            <h3 class="card-title text-base flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Online Report
            </h3>
            <div class="flex gap-2 mt-2">
              <input type="text" value={htmlReportUrl} readonly class="input input-sm input-bordered flex-1 text-xs" />
              <button type="button" class="btn btn-sm btn-ghost px-3" on:click={copyOnlineReportUrl}>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v4m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {htmlReportUrlCopyText || 'Copy'}
              </button>
              <button type="button" class="btn btn-sm btn-info px-3" on:click={openOnlineHtmlReport}>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open
              </button>
            </div>
          </div>
        </div>
        {/if}

        <!-- Sitemaps -->
        {#if sitemapXmlFile || sitemapTxtFile}
        <div class="card card-compact bg-base-200">
          <div class="card-body">
            <h3 class="text-sm font-semibold mb-1">Sitemaps</h3>
            <div class="flex gap-2">
              {#if sitemapXmlFile}
              <button type="button" class="btn btn-xs bg-warning/20 hover:bg-warning text-warning hover:text-warning-content border-0 px-2" on:click={openSitemapXml}>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                sitemap.xml
              </button>
              {/if}
              {#if sitemapTxtFile}
              <button type="button" class="btn btn-xs bg-warning/20 hover:bg-warning text-warning hover:text-warning-content border-0 px-2" on:click={openSitemapTxt}>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                sitemap.txt
              </button>
              {/if}
            </div>
          </div>
        </div>
        {/if}
      </div>

      <!-- Right Column - Exports and Manual Browsing -->
      <div class="lg:col-span-1 space-y-3">
        
        <!-- Website Exports -->
        {#if offlineWebsiteDir || markdownWebsiteDir || markdownSingleFile}
        <div class="card card-compact bg-base-200">
          <div class="card-body">
            <h3 class="card-title text-base flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Website Exports
            </h3>
            <div class="space-y-2 mt-2">
              {#if offlineWebsiteDir}
              <div class="flex items-center justify-between bg-base-300 rounded p-2">
                <span class="text-sm">Offline Website Clone</span>
                <button type="button" class="btn btn-xs bg-warning/20 hover:bg-warning text-warning hover:text-warning-content border-0 px-2" on:click={openOfflineExport}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Browse
                </button>
              </div>
              {/if}
              {#if markdownWebsiteDir}
              <div class="flex items-center justify-between bg-base-300 rounded p-2">
                <span class="text-sm">Markdown Export</span>
                <button type="button" class="btn btn-xs bg-warning/20 hover:bg-warning text-warning hover:text-warning-content border-0 px-2" on:click={openMarkdownExport}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Open
                </button>
              </div>
              {/if}
              {#if markdownSingleFile}
              <div class="flex items-center justify-between bg-base-300 rounded p-2">
                <span class="text-sm">Single-file Markdown</span>
                <button type="button" class="btn btn-xs bg-warning/20 hover:bg-warning text-warning hover:text-warning-content border-0 px-2" on:click={openMarkdownSingleFile}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Open
                </button>
              </div>
              {/if}
            </div>
          </div>
        </div>
        {/if}
        
      </div>
    </div>

    <!-- Manual Browsing Info -->
    {#if reportBaseFilePath}
    <div class="card card-compact bg-base-200 mt-3">
      <div class="card-body">
        <h3 class="text-sm font-semibold mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Manual Browsing
        </h3>
        <p class="text-xs opacity-70 mb-2">All outputs are in the output folder 'SiteOne-Crawler' on your desktop.</p>
        <div class="flex items-center gap-2">
          <div class="text-xs opacity-60 break-all bg-base-300 rounded p-2 flex-1">
            <code>{reportBaseFilePath.replace(/[\/\\][^\/\\]+$/, '')}</code>
          </div>
          <button type="button" class="btn btn-xs btn-ghost px-2" on:click={openTmpDir}>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Open Folder
          </button>
        </div>
      </div>
    </div>
    {/if}

    <!-- CLI Command at bottom -->
    {#if lastCliParams.length > 0}
    <div class="card card-compact bg-base-300 mt-3">
      <div class="card-body">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Executed CLI Command
          </h3>
          <button type="button" class="btn btn-xs btn-ghost px-2" on:click={copyCommand}>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v4m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {commandCopyText || 'Copy'}
          </button>
        </div>
        <div class="mockup-code text-xs">
          <pre><code>./crawler
    {lastCliParams.join(" \\\n    ")}</code></pre>
        </div>
      </div>
    </div>
    {/if}

  {:else}
    <!-- Compact Empty State -->
    <div class="flex flex-col items-center justify-center min-h-[300px] text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h2 class="text-lg font-semibold mb-2">No Reports Yet</h2>
      <p class="text-sm opacity-70 max-w-md">Enter a URL above and start crawling to generate reports.</p>
    </div>
  {/if}
</div>

<style>
  .result-container {
    height: 100%;
    overflow-y: auto;
    padding: 0.75rem;
  }

  .result-container.compact {
    max-height: calc(100vh - 200px);
  }

  .mockup-code {
    @apply bg-base-300;
    padding: 0.75rem;
    border-radius: 0.375rem;
  }

  .mockup-code pre {
    @apply bg-transparent;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .mockup-code code {
    @apply text-warning;
    font-size: 0.75rem;
    line-height: 1.4;
  }

  /* Compact card styles */
  :global(.result-container .card-compact .card-body) {
    padding: 0.75rem;
  }

  :global(.result-container .alert) {
    padding: 0.75rem;
  }

  :global(.result-container .btn-sm) {
    height: 2rem;
    min-height: 2rem;
    font-size: 0.813rem;
  }

  :global(.result-container .btn-xs) {
    height: 1.5rem;
    min-height: 1.5rem;
    font-size: 0.75rem;
  }

  /* Remove gap from buttons with SVG icons */
  :global(.result-container .btn) {
    gap: 0;
  }

  /* Custom scrollbar */
  .result-container::-webkit-scrollbar {
    width: 6px;
  }

  .result-container::-webkit-scrollbar-track {
    @apply bg-base-300;
  }

  .result-container::-webkit-scrollbar-thumb {
    @apply bg-base-content/20 rounded;
  }

  .result-container::-webkit-scrollbar-thumb:hover {
    @apply bg-base-content/30;
  }
</style>