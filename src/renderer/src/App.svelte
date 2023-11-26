<script lang="ts">
    import CrawlerForm from "./components/CrawlerForm.svelte";
    import {onMount, onDestroy} from 'svelte';

    let windowWidth: number = window.innerWidth;
    let windowHeight: number = window.innerHeight;

    function handleResize() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        if (form) {
            form.handleResize();
        }
    }

    function debounce(func, timeout = 100) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        };
    }

    const debouncedResize = debounce(handleResize);
    let form;

    onMount(() => {
        window.addEventListener('resize', debouncedResize);
        window.addEventListener('DOMContentLoaded', () => {
            const platform = window.api.getPlatform();
            document.body.dataset.osplatform = platform;
        });
    });

    onDestroy(() => {
        window.removeEventListener('resize', debouncedResize);
    });
</script>

<div class="container max-h-screen h-screen w-full max-w-full min-w-full">
    <CrawlerForm {windowWidth} {windowHeight} bind:this={form}/>
</div>

<style>
    @import "assets/global.css";
</style>
