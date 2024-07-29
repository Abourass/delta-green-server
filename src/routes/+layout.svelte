<script>
  import "../app.css";
</script>

<style>
  :global(*) {
    --cursor-color: white !important;
    background-color: color-mix(in lch, rgb(10, 10, 10) 40%, rgb(5, 5, 5));
    color: white;
  }

  :global(input){
    color: white !important
  }
</style>

<main class="h-screen w-full text-white text-opacity-90 flex justify-center">
	<slot />
</main>

