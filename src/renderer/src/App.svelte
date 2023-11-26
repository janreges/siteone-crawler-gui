<script lang="ts">
    import CrawlerForm from "./components/CrawlerForm.svelte";
    import {onMount, onDestroy} from 'svelte';

    let windowWidth: number = window.innerWidth;
    let windowHeight: number = window.innerHeight;

    function handleResize() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
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

    onMount(() => {
        window.addEventListener('resize', debouncedResize);
    });

    onDestroy(() => {
        window.removeEventListener('resize', debouncedResize);
    });
</script>

<div class="container max-h-screen h-screen w-full max-w-full min-w-full">
    <CrawlerForm {windowWidth} {windowHeight}/>
</div>

<style>
    @import "assets/global.css";
</style>
