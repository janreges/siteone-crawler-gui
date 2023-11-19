<script lang="ts">
  import { writable } from "svelte/store";

  export let value: string = "";
  export let label: string = "";
  export let tooltip: string = "";
  const htmlId: string = "id" + Math.random().toString(36).substr(2, 9);
  const error = writable("");

  $: {
    const regex = /^\S+@\S+\.\S+$/;
    error.set(!value || regex.test(value) ? "" : "Neplatná e-mailová adresa");
  }
</script>

<div class="form-group">
  <label for={htmlId}>{label}</label>
  <input id={htmlId} type="email" bind:value title={tooltip} />
  {#if $error}
    <span class="error">{$error}</span>
  {/if}
</div>
