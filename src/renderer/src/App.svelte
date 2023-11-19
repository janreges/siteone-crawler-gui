<script lang="ts">
  import CrawlerForm from "./components/CrawlerForm.svelte";
</script>

<div class="container">
  <CrawlerForm />
</div>

<style>
  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 1600px;
    margin: 0 auto;
    padding: 15px 30px 0 30px;
  }
</style>
