<script lang="ts">
  export let checked: boolean = false;
  export let label: string = "";
  export let tooltip: string = "";
</script>

<label style="display: flex; align-items: center;">
  <input type="checkbox" class="checkbox checkbox-xs checkbox-info" bind:checked title={tooltip} style="margin-right: 6px;" />
  {label}
</label>
