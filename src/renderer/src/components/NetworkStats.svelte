<script lang="ts">
  import { onMount } from 'svelte';
  import { LinkedChart } from 'svelte-tiny-linked-charts';

  export let state: 'not-running' | 'running' | 'stopping' | 'stopped' = 'not-running';
  export let crawlingDone: boolean = false;
  export let show: boolean = false;

  let stats: [] = [];
  let lastUpdate: number = new Date().getTime();
  let currentRPS: number = 0;
  let currentDownload: number = 0;
  let selectedRPS: number | null = null;
  let selectedDownload: number | null = null;

  let rpsData: [] = Array(50).fill(0);
  let downloadData: [] = Array(50).fill(0);

  export function addProcessedUrl(contentType: string, duration: number, size: number): void {
    const now = new Date().getTime();
    const second = Math.floor(now / 1000);

    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    stats[second] = stats[second] || { time: currentTime, count: 0, totalSize: 0 };
    stats[second].count++;
    stats[second].totalSize += size;

    if (now - lastUpdate >= 1000) {
      updateStats();
      lastUpdate = now;
    }
  }

  export function reset(): void {
    stats = [];
    rpsData = [];
    downloadData = [];
  }

  function updateStats(): void {
    const now = new Date().getTime();
    const second = Math.floor(now / 1000) - 1;

    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const lastSecondStats = stats[second] || { time: currentTime, count: 0, totalSize: 0 };

    currentRPS = lastSecondStats.count;
    currentDownload = lastSecondStats.totalSize / 1024 / 1024; // MB

    rpsData[lastSecondStats.time] = lastSecondStats.count;
    downloadData[lastSecondStats.time] = (lastSecondStats.totalSize / 1024 / 1024).toFixed(3);

    if (rpsData.length > 60) {
      rpsData.shift();
      downloadData.shift();
    }
  }

  onMount(() => {
    const interval = setInterval(() => {
      if (state === 'running' && !crawlingDone) {
        updateStats();
      }
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

<div class="network-stats" class:visible-with-effect={show} class:hidden-with-effect={!show}>

  <LinkedChart
    data={rpsData}
    barMinWidth="2"
    fill="#cccccc"
    transition="500"
    width="100"
    height="40"
    valueAppend="req/s"
    barMinHeight="2"
    fadeOpacity="0.5"
    dispatchEvents
    on:hover={(event) => selectedRPS = event.detail.value}
    on:blur={() => selectedRPS = null}
  />

  <div class="network-stats-box">
    <span class="text-neutral-300" title="Selected requests per seconds">
      {#if selectedRPS !== null}{selectedRPS} req/s{:else}&nbsp;{/if}
    </span>
    <span class="text-info" title="Current requests per seconds">
      {currentRPS} req/s
    </span>
  </div>

  <LinkedChart
    data={downloadData}
    barMinWidth="2"
    fill="#cccccc"
    transition="500"
    width="100"
    height="40"
    valueAppend="MB/s"
    barMinHeight="2"
    fadeOpacity="0.5"
    dispatchEvents
    on:hover={(event) => selectedDownload = parseFloat(event.detail.value)}
    on:blur={() => selectedDownload = null}
  />

  <div class="network-stats-box">
    <span class="text-neutral-300" title="Selected download speed">
      {#if selectedDownload !== null && typeof selectedDownload === 'number'}{selectedDownload.toFixed(2)} MB/s{:else}&nbsp;{/if}
    </span>
    <span
      class="text-info"
      title="Current download speed (in fact, it is the size of the decompressed content, so the speed will be higher than the actual network transfers)">
      {currentDownload.toFixed(2)} MB/s
    </span>
  </div>

</div>

<style>
    .network-stats {
        position: absolute;
        display: flex;
        gap: 0.3rem;
        flex-direction: row;
        top: -2rem;
        right: 0;
        padding: 0.5rem;
        color: white;
        font-size: 1.1rem;
        z-index: 1000;
    }

    .network-stats-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 0.5rem;
        text-align: right;
        min-width: 92px;
    }

    .network-stats-box span {
        position: relative;
        display: inline-block;
        top: 0.6rem;
        min-width: 70px;
        cursor: help;
        text-align: right;
    }

    :global(.network-stats svg) {
        display: flex;
        position: relative;
        top: 1rem;
    }
</style>
