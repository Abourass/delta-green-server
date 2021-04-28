<script type="ts">
  import Typewriter from 'svelte-typewriter';
  export let onFinish;
</script>


<Typewriter interval={80} on:done={onFinish}>
  <h3 class="text-2xl times24">Files decrypting...</h3>
</Typewriter>
