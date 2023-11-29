<script lang="ts">
    import {CrawlerMiniStatsData} from "../types/CrawlerMiniStatsData";
    export let data = new CrawlerMiniStatsData();
</script>

<div class="flex flex-col w-full items-end" style="font-family: Consolas; font-size: 10px; padding-left: 100px; padding-right: 10px; margin-top: -37px; margin-bottom: 7px">
    <div class="flex flex-col min-w-max">
        <div class=" flex gap-4">
            <div class="flex gap-2">
                <h6 class="font-bold">Response times</h6>
                <div class="flex gap-1">
                    <p>HTML</p>
                    <span>⌀</span>
                    <span class="text-blue-500">{data.htmlTimeAvg}</span>
                    <span>↓</span>
                    <span class="text-green-500">{data.htmlTimeMin}</span>
                    <span>↑</span>
                    <span class="text-red-500">{data.htmlTimeMax}</span>
                </div>
            </div>
            <div class="flex gap-2">
                <h6 class="font-bold">HTTP codes</h6>
                <div class="flex gap-2">
                    <p>20x:<span class:text-green-500={data.code200x !== 0}>{data.code200x}</span></p>
                    <p>30x:<span class:text-orange-500={data.code300x !== 0}>{data.code300x}</span></p>
                    <p>40x:<span class:text-red-500={data.code200x !== 0}>{data.code400x}</span></p>
                    <p>50x:<span class="{data.code500x !== 0 ? 'text-white font-bold bg-red-600 rounded-sm px-1' : ''}">{data.code500x}</span></p>
                    <p>Err:<span class="{data.codeErr !== 0 ? 'text-white font-bold bg-red-600 rounded-sm px-1' : ''}">{data.codeErr}</span></p>
                </div>
            </div>
        </div>
        <div class="flex gap-2">
            <h6 class="font-bold">Content types</h6>
            <div class="flex gap-1">
                <p class="flex gap-1">
                    <span class="bg-neutral-800 rounded-sm px-0.5">HTML</span>
                    {data.contentHtmlNumber}/{data.contentHtmlSize}
                </p>
                <p class="flex gap-1">
                    <span class="bg-neutral-800 rounded-sm px-0.5">IMG</span>
                    {data.contentImgNumber}/{data.contentImgSize}
                </p>
                <p class="flex gap-1">
                     <span class="bg-neutral-800 rounded-sm px-0.5">JS</span>
                     {data.contentJsNumber}/{data.contentJsSize}
                </p>
                <p class="flex gap-1">
                    <span class="bg-neutral-800 rounded-sm px-0.5">CSS</span>
                    {data.contentCssNumber}/{data.contentCssSize}
                </p>
                <p class="flex gap-1">
                    <span class="bg-neutral-800 rounded-sm px-0.5">Fonts</span>
                    {data.contentFontsNumber}/{data.contentFontsSize}
                </p>
                <p class="flex gap-1">
                    <span class="bg-neutral-800 rounded-sm px-0.5">Files</span>
                    {data.contentFilesNumber}/{data.contentFilesSize}
                </p>
            </div>
        </div>
    </div>
</div>