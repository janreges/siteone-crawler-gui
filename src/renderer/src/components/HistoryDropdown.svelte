<script lang="ts">
    import type {HistoryItem} from "../history/HistoryItem";
    import {createEventDispatcher, onMount} from "svelte";

    export let historyItems: HistoryItem[] = [];

    const SHOW_LIMIT = 10;
    let dropdownEl: HTMLDivElement;
    let selectEl: HTMLSelectElement;
    let showMore: boolean = false;
    $: historyItemsToShow = [...historyItems].reverse().slice(0, showMore ? 10000 : SHOW_LIMIT);

    const dispatch = createEventDispatcher();

    function handleChange() {
        const value = selectEl.value;
        if (value === 'erase') {
            dispatch('erase');
        } else if (value === 'showMore') {
            showMore = !showMore;
            selectEl.value = '';
        } else {
            dispatch('loadFromHistory', value);
        }
    }

</script>

<select bind:this={selectEl} class="select select-bordered select-sm mt-2" style="width: 350px;" on:change={handleChange} class:select-disabled={historyItems.length === 0}>
    <option value="">== Load settings from history ({historyItems.length}) ==</option>
    {#each historyItemsToShow as {key, datetime, url}}
        <option value={key}>{datetime} ({url.replace(/^https?:\/\/([^/]+).*$/, '$1')})</option>
    {/each}
    {#if historyItems.length > 0}
        <option value="erase" style="color: #ff4c4c;">••• Erase history •••</option>
    {/if}
    {#if historyItems.length > SHOW_LIMIT}
        <option value="showMore" style="color: #ff9234">••• {showMore ? 'Show less' : 'Show all ' + historyItems.length + ' items'} •••</option>
    {/if}
</select>
