<script lang="ts">
    import type {HistoryItem} from "../history/HistoryItem";
    import {createEventDispatcher, onMount} from "svelte";

    export let historyItems: HistoryItem[] = [];

    const SHOW_LIMIT = 10;
    let dropdownEl: HTMLDivElement;
    let showMore: boolean = false;
    $: historyItemsToShow = historyItems.slice(0, showMore ? 10000 : SHOW_LIMIT);

    const dispatch = createEventDispatcher();

    onMount(() => {
        const dropdownContent = document.querySelectorAll(".dropdown-content>li>a");
        dropdownContent.forEach((element) => {
            element.addEventListener("click", () => {
                document.activeElement.blur();
            });
        });
    });

</script>
<div bind:this={dropdownEl} class="dropdown dropdown-end dropdown-hover">
    <div tabindex="0" role="button" class="btn m-1">History ({historyItems.length})</div>
    <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box" style="width: 360px;">
        {#each historyItemsToShow.reverse() as {key, datetime, url}}
            <li><a href="#" on:click={() => {dispatch('loadFromHistory', key); dropdownEl.classList.toggle('dropdown-open'); document.activeElement.blur()}}>{datetime} ({url.replace(/^https?:\/\/([^/]+).*$/, '$1')})</a></li>
        {/each}
        {#if historyItems.length > 0}
            <li><a class="link link-warning" title="Erase history" aria-label="Erase history" on:click={() => dispatch('erase')}>Erase history</a></li>
        {/if}
        {#if historyItems.length > SHOW_LIMIT}
            <li><a class="link link-info" title="Show more" aria-label="Show more" on:click={() => showMore = !showMore}>{showMore ? 'Show less' : 'Show more'}</a></li>
        {/if}
    </ul>
</div>
