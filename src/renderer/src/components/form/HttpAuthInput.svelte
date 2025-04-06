<script lang="ts">
  import { writable } from "svelte/store";

  export let value: string = "";
  export let label: string = "";
  export let tooltip: string = "";
  const htmlId: string = "id" + Math.random().toString(36).substr(2, 9);
  const error = writable("");

  // Basic regex for username:password format. Allows almost any character except colon in username/password.
  const httpAuthRegex = /^[^:]+:[^:]+$/;

  $: {
    error.set(!value || httpAuthRegex.test(value) ? "" : "Invalid format (expected username:password)");
  }
</script>

<div class="form-group">
  <label for={htmlId}>{label}</label>
  <input id={htmlId} type="text" class="input input-bordered input-xs max-w-xs" bind:value title={tooltip} />
  {#if $error}
    <span class="error">{$error}</span>
  {/if}
</div>