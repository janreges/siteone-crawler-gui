<svelte:options accessors />
<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import type {HistoryStorage} from "../../history/HistoryStorage";
    import CrawlerFormContent from "../../types/CrawlerFormContent";

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
    $: historyItems = historyStorage.getItems();

    function handleKeydown(event) {
        if (event.key === 'Enter' && value.match(/^https?:\/\/[^/]{3,}/)) {
            dispatch('run');
        }
    }

    function handleLoadFromHistory(event) {
        const historyItem = historyStorage.getItemByKey(event.target.value);
        if (historyItem) {
            const formData = JSON.parse(historyItem.formData);
            if (formData) {
                dispatch('loadFromHistory', new CrawlerFormContent(formData));
            }
        }2
    }

    function handleFlush() {
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

<div class="form-group form-group-url" bind:this={containerDiv} style="width: 100%; margin-bottom: 20px;">
    URL:
    <input id={htmlId}
           type="text"
           class="input input-bordered w-full max-w-xs text-blue-500"
           bind:value
           title={tooltip}
           placeholder="https://"
           style="min-width: 450px;"
           disabled={formState === 'running' || formState === 'stopping'}
           on:keydown={handleKeydown}
    />
    {#if formState === 'not-running'}
        <button class="btn text-blue-500" type="button" on:click={() => dispatch('run')} disabled={!value.match(/^https?:\/\/[^/]{3,}/)}> Run crawler</button>
    {:else if formState === 'stopping'}
        <button class="btn text-gray-500 btn-disabled" type="button"><span class="loading loading-spinner loading-sm"></span> Stopping...</button>
    {:else}
        <button class="btn text-red-500" type="button" on:click={() => dispatch('stop')}><span class="loading loading-spinner loading-sm"></span> Stop crawler</button>
    {/if}

    <div>
        <select class="select select-xs select-bordered w-full max-w-xs" bind:value={selectedHistoryItemKey} on:change={handleLoadFromHistory} disabled={formState === 'running' || formState === 'stopping'}>
            <option disabled selected value="">Load from history ({historyItems.length})</option>
            {#each historyItems.reverse() as {key, datetime, url}}
                <option value={key}>{datetime} ({url.replace(/^https?:\/\/([^/]+).*$/, '$1')})</option>
            {/each}
        </select>
        <a class="btn btn-xs" title="Erase history" on:click={handleFlush} class:btn-disabled={historyItems.length === 0}>Erase history</a>
        <!--{#if htmlReportFilePath}-->
        <!--    <a class="btn btn-xs btn-success btn-active" href="#" on:click={openHtmlReportInBrowser}>Open report</a>-->
        <!--{:else}-->
        <!--    <a class="btn btn-xs btn-disabled">Report not ready</a>-->
        <!--{/if}-->
    </div>


</div>
