<script type="ts">
  export let value = '';
  export let label = '';
</script>

<style>
  label {
    font-size: 1.5rem;
  }

  input {
    font-size: 1.2rem;
    color: black;
    padding-left: .4rem;
    height: 26px;
    border-radius: 2px;
    margin-top: auto;
    margin-bottom: auto;
    margin-left: .2rem;
  }
</style>

<div class="flex content-center">
  <label class="flex flex-row justify-between w-full">
    <span>{label}</span>
    <input type="text" bind:value={value}>
  </label>
</div>
