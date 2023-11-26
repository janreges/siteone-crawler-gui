<script lang="ts">
    import {createEventDispatcher} from 'svelte';
    import type {HistoryStorage} from "../../history/HistoryStorage";
    import CrawlerFormContent from "../../types/CrawlerFormContent";

    export let value: string = "";
    export let label: string = "";
    export let tooltip: string = "";
    export let formState: string;

    export let historyStorage:HistoryStorage;

    const htmlId: string = "id" + Math.random().toString(36).substr(2, 9);
    const dispatch = createEventDispatcher();
    let selectedHistoryItemKey = '';
    $: historyItems = historyStorage.getItems();

    function handleKeydown(event) {
        if (event.key === 'Enter') {
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
        if (window.confirm('Are you sure you want to erase history?')) {
            historyStorage.flush();
            historyStorage = historyStorage;
            selectedHistoryItemKey = '';
        }
    }

</script>

<div class="form-group form-group-url" style="width: 100%; margin-bottom: 20px;">
    URL:
    <input id={htmlId}
           type="text"
           class="input input-bordered w-full max-w-xs text-blue-500"
           bind:value
           title={tooltip}
           placeholder="https://"
           style="min-width: 500px;"
           on:keydown={handleKeydown}
    />
    {#if formState === 'not-running'}
        <button class="btn text-blue-500" type="button" on:click={() => dispatch('run')}> Run crawler</button>
    {:else if formState === 'stopping'}
        <button class="btn text-gray-500 btn-disabled" type="button"><span class="loading loading-spinner loading-sm"></span> Stopping...</button>
    {:else}
        <button class="btn text-red-500" type="button" on:click={() => dispatch('stop')}><span class="loading loading-spinner loading-sm"></span> Stop crawler</button>
    {/if}

    <div>
        <select class="select select-xs select-bordered w-full max-w-xs" bind:value={selectedHistoryItemKey} on:change={handleLoadFromHistory}>
            <option disabled selected value="">Load from history ({historyItems.length})</option>
            {#each historyItems.reverse() as {key, datetime, url}}
                <option value={key}>{datetime} ({url})</option>
            {/each}
        </select>
        <a class="btn btn-xs text-red-600" title="Erase history" on:click={handleFlush}>x</a>
    </div>


</div>
