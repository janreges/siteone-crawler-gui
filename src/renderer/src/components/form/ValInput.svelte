<script lang="ts">
  export let value: string = "";
  export let label: string = "";
  export let tooltip: string = "";
  const htmlId: string = "id" + Math.random().toString(36).substr(2, 9);
</script>

<div class="form-group">
  <label for={htmlId}>{label}</label>
  <input id={htmlId} type="text" class="input input-bordered input-xs" bind:value title={tooltip} />
</div>
