<script type="ts">
  export let value = '';
  export let label = '';
  export let inputClasses = '';
  export let labelClasses = '';
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
  <label class={labelClasses + " flex flex-row justify-between w-full times24"}>
    <span>{label}</span>
    <input type="text" bind:value={value} class={inputClasses + " w-44"} />
  </label>
</div>
