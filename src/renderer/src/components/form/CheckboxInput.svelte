<script lang="ts">
  export let checked: boolean = false;
  export let label: string = "";
  export let tooltip: string = "";
</script>

<label>
  <input type="checkbox" class="checkbox checkbox-xs" bind:checked title={tooltip} />
  {label}
</label>
