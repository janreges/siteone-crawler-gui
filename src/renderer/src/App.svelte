<script lang="ts">
    import CrawlerForm from "./components/CrawlerForm.svelte";
    import {onMount, onDestroy} from 'svelte';
    import { VERSION } from './types/CrawlerInfo';

    let windowWidth: number = window.innerWidth;
    let windowHeight: number = window.innerHeight;
    let osPlatform: string = window.api.getPlatform();
    let osArchitecture: string = window.api.getArchitecture();

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

    function openCrawlerHomepage():void {
        window.api.openExternal('https://crawler.siteone.io/?utm_source=app&utm_medium='+osPlatform+'&utm_campaign='+osArchitecture+'&utm_content='+VERSION);
    }
</script>

<div class="container max-h-screen h-screen w-full max-w-full min-w-full">
    <CrawlerForm {windowWidth} {windowHeight} bind:this={form}/>
</div>
<div class="footer">
    Made by <a href="mailto:jan.reges@siteone.cz?subject=SiteOne Crawler feedback" class="text-info">Ján Regeš</a> @ 2023-2025 | v1.0.8 | <a on:click={openCrawlerHomepage} target="_blank" class="text-info cursor-pointer">crawler.siteone.io</a>
</div>

<style>
    @import "assets/global.css";

    .footer {
        position: fixed;
        display: flex;
        max-width: fit-content;
        border-top-left-radius: 6px !important;
        text-align: right;
        justify-content: right;
        column-gap: 4px;
        min-width: 200px;
        opacity: 0.4;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.2);
        color: #cccccc;
        padding: 0px 4px;
        font-size: 12px;
        z-index: 1100;
    }

</style>
