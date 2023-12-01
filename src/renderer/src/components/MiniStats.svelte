<script lang="ts">

    import type { MiniStatsData } from '../types/MiniStatsData';

    export let data: MiniStatsData;
    export let fontFamily: string;

    function formatTime(seconds: number | null): string {
        return seconds === null ? '-' : ((seconds * 1024).toFixed(0) + ' ms');
    }

    function formatCount(count: number | null): string {
        if (count === null) {
            return '-';
        } else if (count < 1000) {
            return count.toString();
        } else if (count < 1000 * 1000) {
            return count.toLocaleString();
        } else {
            return count.toString();
        }
    }

    function formatSize(bytes: number | null): string {
        if (bytes === null) {
            return '-';
        } else if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(0) + ' kB';
        } else if (bytes < 1024 * 1024 * 1024) {
            return (bytes / 1024 / 1024).toFixed(1) + ' MB';
        } else {
            return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB';
        }
    }

</script>

<div class="mini-stats flex flex-col w-full items-end"
     style="font-family: {fontFamily}; padding-left: 100px; padding-right: 10px; margin-top: -37px; margin-bottom: 7px">
    <div class="flex flex-col min-w-max">
        <div class=" flex gap-4">
            <div class="flex gap-2">
                <h6 class="font-bold">Response times</h6>
                <div class="flex gap-1">
                    <p>HTML</p>
                    <span>⌀</span>
                    {#if data.htmlTimeAvgDirection === 'up'}
                        <span class="text-red-600 cursor-help" title="The average duration has an increasing tendency">🡅</span>
                    {:else if data.htmlTimeAvgDirection === 'down'}
                        <span class="text-green-600 cursor-help" title="The average duration has a decreasing tendency">🡇</span>
                    {/if}
                    <span class="text-blue-500 cursor-help" title="Average HTML response time">{formatTime(data.htmlTimeAvg)}</span>
                    <span>↓</span>
                    <span class="text-green-500 cursor-help" title="Min HTML response time">{formatTime(data.htmlTimeMin)}</span>
                    <span>↑</span>
                    <span class="text-red-500 cursor-help" title="Max HTML response time">{formatTime(data.htmlTimeMax)}</span>
                </div>
            </div>
            <div class="flex gap-2">
                <h6 class="font-bold">HTTP codes</h6>
                <div class="flex gap-2">
                    <p>20x: <span class="cursor-help" title="Number of requests with HTTP code 20x" class:text-green-500={data.code200x}>{formatCount(data.code200x)}</span></p>
                    <p>30x: <span class="cursor-help" title="Number of requests with HTTP code 30x" class:text-orange-500={data.code300x}>{formatCount(data.code300x)}</span></p>
                    <p>40x: <span class="cursor-help" title="Number of requests with HTTP code 40x" class:text-red-500={data.code200x}>{formatCount(data.code400x)}</span></p>
                    <p>50x: <span title="Number of requests with HTTP code 50x" class="{data.code500x ? 'text-white font-bold bg-red-600 rounded-sm px-1 cursor-help' : ''}">{formatCount(data.code500x)}</span></p>
                    <p>Err: <span title="Number of requests with an unknown HTTP code (timeout, connection and other errors)" class="{data.codeErr ? 'text-white font-bold bg-red-600 rounded-sm px-1 cursor-help' : ''}">{formatCount(data.codeErr)}</span></p>
                </div>
            </div>
        </div>
        <div class="flex gap-2">
            <h6 class="font-bold">Content types</h6>
            <div class="flex gap-1">
                <p class="flex gap-1">
                    <span class="border-neutral-800 bg-neutral-900 rounded-md px-0.5" style="border-width: 1px;">HTML</span>
                    {formatCount(data.contentHtmlNumber)}/{formatSize(data.contentHtmlSize)}
                </p>
                <p class="flex gap-1">
                    <span class="border-neutral-800 bg-neutral-900 rounded-md px-0.5" style="border-width: 1px;">IMG</span>
                    {formatCount(data.contentImgNumber)}/{formatSize(data.contentImgSize)}
                </p>
                <p class="flex gap-1">
                    <span class="border-neutral-800 bg-neutral-900 rounded-md px-0.5" style="border-width: 1px;">JS</span>
                    {formatCount(data.contentJsNumber)}/{formatSize(data.contentJsSize)}
                </p>
                <p class="flex gap-1">
                    <span class="border-neutral-800 bg-neutral-900 rounded-md px-0.5" style="border-width: 1px;">CSS</span>
                    {formatCount(data.contentCssNumber)}/{formatSize(data.contentCssSize)}
                </p>
                <p class="flex gap-1">
                    <span class="border-neutral-800 bg-neutral-900 rounded-md px-0.5" style="border-width: 1px;">Fonts</span>
                    {formatCount(data.contentFontsNumber)}/{formatSize(data.contentFontsSize)}
                </p>
                <p class="flex gap-1">
                    <span class="border-neutral-800 bg-neutral-900 rounded-md px-0.5" style="border-width: 1px;">Files</span>
                    {formatCount(data.contentFilesNumber)}/{formatSize(data.contentFilesSize)}
                </p>
            </div>
        </div>
    </div>
</div>

<style>
    .mini-stats {
        font-size: 12px;
    }

    @media (max-width: 780px) {
        .mini-stats {
            font-size: 10px;
        }
    }

    @media (max-width: 700px) {
        .mini-stats {
            font-size: 9px;
        }
    }

    @media (max-width: 640px) {
        .mini-stats {
            font-size: 8px;
        }
    }

    @media (max-width: 590px) {
        .mini-stats {
            font-size: 7px;
        }
    }

</style>
