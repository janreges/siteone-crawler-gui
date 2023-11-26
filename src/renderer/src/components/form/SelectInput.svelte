<script lang="ts">
  export let value: string = "";
  export let options: string[] = [];
  export let label: string = "";
  export let tooltip: string = "";
  const htmlId: string = "id" + Math.random().toString(36).substr(2, 9);
</script>

<div class="form-group">
  <label for={htmlId}>{label}</label>
  <select id={htmlId} bind:value title={tooltip} class="select select-bordered select-xs">
    {#each options as option}
      <option value={option}>{option}</option>
    {/each}
  </select>
</div>
