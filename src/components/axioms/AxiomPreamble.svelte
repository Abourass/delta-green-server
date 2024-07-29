<script type="ts">
  import Typewriter from 'svelte-typewriter';
  export let onFinish;
</script>

<Typewriter cascade on:done={onFinish}>
  <p class="text-center pb-4"> Here are those <span class="text-delta-green">"Rogers' Rules of Ranging"</span> we talked about. </p>

  <p class="text-center"> I have no idea whether they actually came from <span class="text-delta-green">Alphonse</span>.</p>

  <p class="text-center"> Writing all this down doesn't seem like the old man's style..</p>

  <p class="text-center"> Maybe it started with him, but it's been making the rounds a long time.</p>

  <p class="text-center">Who knows how many of us have added to it over the years?</p>

  <p class="text-center"> If you share it with any FNGs, be sure to tell them not to mistake it for intelligence tradecraft. </p>

  <p class="text-center pb-4"> It's tradecraft for <span class="text-delta-green">Delta Green</span> agents on the ground.</p>
  
  <ul class="flex flex-col justify-center items-center pb-4">
    <p class="text-delta-green">It all comes back to the same old mission:</p>
    <li> Find the threat </li>
    <li> Stop the threat </li>
    <li> Cover it up so it's like the threat never happened </li>
  </ul>

</Typewriter>
