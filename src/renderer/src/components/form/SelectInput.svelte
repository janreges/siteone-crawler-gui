<script lang="ts">
  export let value: string = "";
  export let options: string[] = [];
  export let optionLabels: string[] = [];
  export let label: string = "";
  export let tooltip: string = "";
  const htmlId: string = "id" + Math.random().toString(36).substr(2, 9);
  
  // Use optionLabels if provided, otherwise use options
  $: displayLabels = optionLabels.length > 0 ? optionLabels : options;
</script>

<div class="form-group">
  <label for={htmlId}>{label}</label>
  <select id={htmlId} bind:value title={tooltip} class="select select-bordered select-xs" style="min-width: 0;">
    {#each options as option, i}
      <option value={option}>{displayLabels[i]}</option>
    {/each}
  </select>
</div>
