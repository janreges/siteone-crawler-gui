<script lang="ts">
  import { onMount } from 'svelte';
  import { LinkedChart } from 'svelte-tiny-linked-charts';

  export let state: 'not-running' | 'running' | 'stopping' | 'stopped' = 'not-running';

  let stats: [] = [];
  let lastUpdate: number = new Date().getTime();
  let currentRPS: number = 0;
  let currentDownload: number = 0;

  let rpsData: [] = [];
  let downloadData: [] = [];

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
    downloadData[lastSecondStats.time] = (lastSecondStats.totalSize / 1024 / 1024).toFixed(1);

    if (rpsData.length > 60) {
      rpsData.shift();
      downloadData.shift();
    }
  }

  onMount(() => {
    const interval = setInterval(() => {
      if (state === 'running') {
        updateStats();
      }
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

<div class="network-stats">
  <span class="text-success" title="Current requests per seconds">
    {currentRPS} reqs/s
  </span>
  <LinkedChart data={rpsData} showValue valuePosition="floating" barMinWidth="2" fill="#ffcc00" transition="500" width="100" height="40" valueAppend="reqs/s" barMinHeight="2" linked="link-1" />
  <span
    class="text-success"
    title="Current download speed (in fact, it is the size of the decompressed content, so the speed will be higher than the actual network transfers)">
    {currentDownload.toFixed(1)} MB/s
  </span>
  <LinkedChart data={downloadData} showValue valuePosition="static" barMinWidth="2" fill="#ffcc00" transition="500" width="100" height="40" valueAppend="MB/s" barMinHeight="2" linked="link-1" />
</div>

<style>
    .network-stats {
        position: absolute;
        top: 0;
        right: 0;
        padding: 0.5rem;
        color: white;
        font-size: 1.1rem;
        z-index: 1000;
    }

    .network-stats span {
        margin-left: 0.5rem;
        position: relative;
        top: 0.6rem;
        cursor: help;
    }

    :global(.network-stats svg) {
        display: inline-block;
    }
</style>
