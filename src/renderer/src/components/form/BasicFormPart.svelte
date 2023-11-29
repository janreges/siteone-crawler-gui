<svelte:options accessors />
<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import type {HistoryStorage} from "../../history/HistoryStorage";
    import CrawlerFormContent from "../../types/CrawlerFormContent";
    import HistoryDropdown from "../HistoryDropdown.svelte";

    export let value: string = "";
    export let label: string = "";
    export let tooltip: string = "";
    export let formState: string;
    export let htmlReportFilePath: string = "";

    export let historyStorage:HistoryStorage;
    let containerDiv: HTMLDivElement;
    export let containerDivHeight: number;

    const htmlId: string = "id" + Math.random().toString(36).substr(2, 9);
    const dispatch = createEventDispatcher();
    let selectedHistoryItemKey = '';
    let urlInput: HTMLInputElement;
    $: historyItems = historyStorage.getItems();

    function handleKeydown(event) {
        if (event.key === 'Enter' && value.match(/^https?:\/\/[^/]{3,}/)) {
            dispatch('run');
        }
    }

    function handleLoadFromHistory(event) {
        loadFromHistory(event.target.value);
    }

    function loadFromHistory(historyItemKey:string):void
    {
        const historyItem = historyStorage.getItemByKey(historyItemKey);
        if (historyItem) {
            const formData = JSON.parse(historyItem.formData);
            if (formData) {
                dispatch('loadFromHistory', new CrawlerFormContent(formData));
            }
        }
    }

    function handleEraseHistory() {
        if (window.confirm('Are you sure you want to erase history? ')) {
            historyStorage.flush();
            historyStorage = historyStorage;
            selectedHistoryItemKey = '';
        }
    }

    function updateHeight() {
        containerDivHeight = containerDiv.clientHeight;
        console.log('containerDivHeight', containerDivHeight);
    }

    var debounceTimer;
    function debounce(func, delay) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(func, delay);
    }

    onMount(() => {
        urlInput.focus();

        const resizeObserver = new ResizeObserver(entries => {
            debounce(() => {
                for (let entry of entries) {
                    entry = entry; // to avoid unused variable warning
                    updateHeight();
                }
            }, 100);
        });

        resizeObserver.observe(containerDiv);

        return () => {
            resizeObserver.unobserve(containerDiv);
        };
    });

    // function openHtmlReportInBrowser(): void {
    //     window.api.openExternal('file://' + htmlReportFilePath);
    // }

</script>

<div class="form-group form-group-url flex justify-between flex-wrap" bind:this={containerDiv} style="width: 100%; margin-bottom: 20px; align-items: start">
    <div class="flex gap-4">
        <a on:click={() => dispatch('openCrawlerHomepage')} style="cursor: pointer" title="Open Crawler homepage" aria-label="Open Crawler homepage">
          <svg style="margin-top: 7px;" width="70px" height="34px" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 119 59" xml:space="preserve">
              <path d="M49.4 29.1L49.4 29.1L49.4 29.1l8.8-8.8l0 0h0V0h-9.9v16.2l-5.9 5.9L29.1 8.9L15.9 22.1l-5.9-5.9V0H0v20.2h0l0 0l8.8 8.8
                  l0 0l0 0L0 37.9l0 0h0v20.2h9.9V42l5.9-5.9l13.3 13.3l13.3-13.3l5.9 5.9v16.2h9.9V38h0l0 0L49.4 29.1z M29.1 35.4l-6.3-6.3l6.3-6.3
                  l6.3 6.3L29.1 35.4z" fill="#FFFFFF"/>
              <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M92.3 15v33.2H75.5v10H119v-10h-16.4V0h-9.3L67.1 26.2l7 7C74.1 33.2 92.3 15 92.3 15z"
                    fill="#777777"/>
          </svg>
        </a>
        <div class="flex flex-col">
            <div class="flex flex-row">
                <input id={htmlId}
                       bind:this={urlInput}
                       type="text"
                       class="input input-bordered w-full max-w-xs input-md text-info"
                       bind:value
                       title={tooltip}
                       placeholder="https://"
                       style="min-width: 350px;"
                       disabled={formState === 'running' || formState === 'stopping'}
                       on:keydown={handleKeydown}
                />
                {#if formState === 'not-running'}
                    <button class="btn btn-md text-success ml-2" type="button" on:click={() => dispatch('run')} disabled={!value.match(/^https?:\/\/[a-z0-9.]{1,253}/)}> Run</button>
                {:else if formState === 'stopping'}
                    <button class="btn btn-md btn-disabled text-gray-500 ml-2" type="button"><span class="loading loading-spinner loading-sm"></span> Stopping...</button>
                {:else}
                    <button class="btn btn-md text-red-500 ml-2" type="button" on:click={() => dispatch('stop')}><span class="loading loading-spinner loading-sm"></span> Stop</button>
                {/if}
            </div>
            <div>
                <HistoryDropdown {historyItems} on:erase={() => handleEraseHistory()} on:loadFromHistory={(event) => loadFromHistory(event.detail)} />
            </div>
        </div>
    </div>
    <slot />
</div>
