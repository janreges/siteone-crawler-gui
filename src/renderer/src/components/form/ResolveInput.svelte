<script lang="ts">
  import { writable } from "svelte/store";

  export let value: string = "";
  export let label: string = "";
  export let tooltip: string = "";
  const htmlId: string = "id" + Math.random().toString(36).substr(2, 9);
  const error = writable("");

  // Basic regex for domain:port:ip format. Might need refinement for stricter validation.
  // Domain: Allows letters, numbers, dots, hyphens.
  // Port: Allows numbers.
  // IP: Allows IPv4-like and IPv6-like characters (numbers, letters a-f, colons, dots).
  const resolveRegex = /^[a-zA-Z0-9.-]+:[0-9]+:[0-9a-fA-F:.]+$/;

  $: {
    error.set(!value || resolveRegex.test(value) ? "" : "Invalid format (expected domain:port:ip, e.g., www.example.com:80:127.0.0.1)");
  }
</script>

<div class="form-group">
  <label for={htmlId}>{label}</label>
  <input id={htmlId} type="text" class="input input-bordered input-xs max-w-xs" bind:value title={tooltip} />
  {#if $error}
    <span class="error">{$error}</span>
  {/if}
</div>