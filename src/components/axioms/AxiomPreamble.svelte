<script type="ts">
  import Typewriter from 'svelte-typewriter';
  export let onFinish;
</script>

<Typewriter cascade on:done={onFinish}>
  <br />
  <p> Here are those <span class="text-delta-green">"Rogers' Rules of Ranging"</span> we talked about. </p>
  <br />
  <span> I have no idea whether they actually came from <span class="text-delta-green">Alphonse</span>.</span>
  <br />
  <span> Writing all this down doesn't seem like the old man's style..</span>
  <br />
  <span> Maybe it started with him, but it's been making the rounds a long time.</span>
  <br />
  <p>Who knows how many of us have added to it over the years?</p>
  <br />
  <span> If you share it with any FNGs, be sure to tell them not to mistake it for intelligence tradecraft. </span>
  <br />
  <p> It's tradecraft for <span class="text-delta-green">Delta Green</span> agents on the ground.</p>
  <br />
  <span class="text-delta-green">It all comes back to the same old mission:</span>
  <ul>
    <li> Find the threat </li>
    <li> Stop the threat </li>
    <li> Cover it up so it's like the threat never happened </li>
  </ul>
  <br />
</Typewriter>
