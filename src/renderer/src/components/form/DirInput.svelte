<script lang="ts">
  import { writable } from "svelte/store";

  export let value: string = "";
  export let label: string = "";
  export let tooltip: string = "";
  export let placeholder: string = "";
  const htmlId: string = "id" + Math.random().toString(36).substr(2, 9);
  const error = writable("");

  $: {
    const regex = /^[a-zA-Z0-9\-_.]+$/;
    error.set(!value || regex.test(value) ? "" : "Invalid characters - only letters, numbers, dashes, underscores and dots are allowed.");
  }
</script>

<div class="form-group">
  <label for={htmlId}>{label}</label>
  <input id={htmlId} type="text" class="input input-bordered input-xs" bind:value title={tooltip} placeholder={placeholder} />
  {#if $error}
    <span class="error">{$error}</span>
  {/if}
</div>
