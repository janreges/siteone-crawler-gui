<script lang="ts">
    import type {TimelineState} from "../types/TimelineState";
    import { createEventDispatcher } from 'svelte';

    export let state:TimelineState;
    export let fontFamily: string | null = 'Consolas';
    const dispatch = createEventDispatcher();
</script>

<div style="font-family: {fontFamily}; font-size: 0.9em;">
    <ul class="timeline">
        <li>
            <div class="timeline-start timeline-box timeline-box-small" class:text-black={state.started} class:bg-success={state.started}><strong>Start</strong></div>
            <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                     class="w-5 h-5" class:text-success={state.started}>
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd"/>
                </svg>
            </div>
            <hr class:bg-warning={state.progressPercentage !== null && state.progressPercentage < 100} class:bg-success={state.progressPercentage === 100}/>
        </li>
        <li>
            <hr class:bg-warning={state.progressPercentage !== null && state.progressPercentage < 100} class:bg-success={state.progressPercentage === 100}/>
            <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                     class="w-5 h-5" class:text-warning={state.progressPercentage !== null && state.progressPercentage < 100} class:text-success={state.progressPercentage === 100}>
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd"/>
                </svg>
            </div>
            <div
              class="timeline-end timeline-box timeline-box-small text-center"
              class:text-black={state.progressPercentage !== null}
              class:bg-warning={state.progressPercentage !== null && state.progressPercentage < 100}
              class:bg-success={state.progressPercentage === 100}
              style="min-width: 106px;">
              {#if state.progressPercentage !== null}<strong>{state.progressPercentage}%</strong>: {state.progressCurrent}/{state.progressTotal}{:else}0%{/if}
            </div>
            <hr class:bg-warning={state.progressPercentage === 100 && !state.htmlReport} class:bg-success={state.htmlReport}/>
        </li>
        <li>
            <hr class:bg-warning={state.progressPercentage === 100 && !state.htmlReport} class:bg-success={state.htmlReport}/>
            <div class="timeline-start timeline-box timeline-box-small" style="white-space: nowrap; text-align: center" class:text-black={state.htmlReport} class:bg-success={state.htmlReport}>
              {#if state.htmlReport}
                <a class="timeline-link" title="Open HTML report" aria-label="Open HTML report" on:click={() => dispatch('openHtmlReport')}>
                  HTML report
                  <svg class="text-black" width="14px" height="14px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: inline-block;">
                    <title>Open HTML report</title>
                    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <g id="icon" fill="currentColor" transform="translate(85.333333, 64.000000)">
                        <path d="M128,63.999444 L128,106.666444 L42.6666667,106.666667 L42.6666667,320 L256,320 L256,234.666444 L298.666,234.666444 L298.666667,362.666667 L4.26325641e-14,362.666667 L4.26325641e-14,64 L128,63.999444 Z M362.666667,1.42108547e-14 L362.666667,170.666667 L320,170.666667 L320,72.835 L143.084945,249.751611 L112.915055,219.581722 L289.83,42.666 L192,42.6666667 L192,1.42108547e-14 L362.666667,1.42108547e-14 Z" id="Combined-Shape">
                        </path>
                      </g>
                    </g>
                  </svg>
                </a>
              {:else}HTML report{/if}
            </div>
            <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                     class="w-5 h-5" class:text-success={state.htmlReport}>
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd"/>
                </svg>
            </div>
            <hr class:bg-success={state.offlineExport || state.finished}>
        </li>
        <li>
            <hr class:bg-success={state.offlineExport || state.finished}>
            <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" class:text-success={state.offlineExport}>
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd"/>
                </svg>
            </div>
            <div class="timeline-end timeline-box timeline-box-small" style="white-space: nowrap; text-align: center" class:text-black={state.offlineExport} class:bg-success={state.offlineExport}>
              {#if state.offlineExport}
                <a class="timeline-link" on:click={() => dispatch('openOfflineExport')}>
                  Website clone
                  <svg class="text-black" width="14px" height="14px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: inline-block;">
                    <title>Open offline website clone</title>
                    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <g id="icon" fill="currentColor" transform="translate(85.333333, 64.000000)">
                        <path d="M128,63.999444 L128,106.666444 L42.6666667,106.666667 L42.6666667,320 L256,320 L256,234.666444 L298.666,234.666444 L298.666667,362.666667 L4.26325641e-14,362.666667 L4.26325641e-14,64 L128,63.999444 Z M362.666667,1.42108547e-14 L362.666667,170.666667 L320,170.666667 L320,72.835 L143.084945,249.751611 L112.915055,219.581722 L289.83,42.666 L192,42.6666667 L192,1.42108547e-14 L362.666667,1.42108547e-14 Z" id="Combined-Shape">
                        </path>
                      </g>
                    </g>
                  </svg>
                </a>
              {:else}Website clone{/if}
            </div>
            <hr class:bg-success={state.offlineExport || state.finished}>
        </li>
        <li>
          <hr class:bg-success={state.markdownExport || state.finished}>
          <div class="timeline-middle">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" class:text-success={state.markdownExport}>
                  <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clip-rule="evenodd"/>
              </svg>
          </div>
          <div class="timeline-start timeline-box timeline-box-small" style="white-space: nowrap; text-align: center" class:text-black={state.markdownExport} class:bg-success={state.markdownExport}>
            {#if state.markdownExport}
              <a class="timeline-link" on:click={() => dispatch('openMarkdownExport')}>
                Markdown
                <svg class="text-black" width="14px" height="14px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: inline-block;">
                  <title>Open markdown version</title>
                  <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="icon" fill="currentColor" transform="translate(85.333333, 64.000000)">
                      <path d="M128,63.999444 L128,106.666444 L42.6666667,106.666667 L42.6666667,320 L256,320 L256,234.666444 L298.666,234.666444 L298.666667,362.666667 L4.26325641e-14,362.666667 L4.26325641e-14,64 L128,63.999444 Z M362.666667,1.42108547e-14 L362.666667,170.666667 L320,170.666667 L320,72.835 L143.084945,249.751611 L112.915055,219.581722 L289.83,42.666 L192,42.6666667 L192,1.42108547e-14 L362.666667,1.42108547e-14 Z" id="Combined-Shape">
                      </path>
                    </g>
                  </g>
                </svg>
              </a>
            {:else}Markdown{/if}
          </div>
          <hr class:bg-success={state.finished}>
      </li>
        <li>
            <hr class:bg-success={state.finished}>
            <div class="timeline-end timeline-box timeline-box-small" class:text-black={state.finished} class:bg-success={state.finished}><strong>Finish</strong></div>
            <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" class:text-success={state.finished}>
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd"/>
                </svg>
            </div>
        </li>
    </ul>
    <progress
        class="progress w-148"
        value={state.progressPercentage}
        max="100"
        class:hidden-with-effect={state.progressPercentage === null || state.progressPercentage === 0 || state.progressPercentage === 100}
        class:visible-with-effect={state.progressPercentage !== null && state.progressPercentage !== 100}
        class:progress-warning={state.progressPercentage < 90}
        class:progress-success={state.progressPercentage >= 90}
    ></progress>
</div>

