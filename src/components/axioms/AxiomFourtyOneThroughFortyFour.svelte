<script type="ts">
  import Typewriter from 'svelte-typewriter';
  import LoopDecode from '../effects/LoopDecode.svelte';

  let showFrom = false
</script>

<Typewriter cascade interval={20} on:done={() => showFrom = true}>
  <br />
  <ol>
    <li>
      <p>41. <span class="text-delta-green">Do not use any system of planar manipulation that could be taken for actual magic.</span></p>
      <br />
      <p class="pl-6">  <span class="text-delta-green">You will become part of the problem.</span> </p>
      <br />
      <p class="pl-6">  Concentrate on solving the problem before the supernatural becomes your only option. </p>
      <br />
      <p class="pl-6">  If you do end up using such systems, always tell A-Cell that you did. </p>
      <br />
      <p class="pl-6">  The consequences are far preferable to having A-Cell find out later that you kept it a secret. </p>
    </li>
    <br />
    <li>
      <p>42. <span class="text-delta-green">Never leave teammates behind where the authorities can find them.</span></p>
    </li>
    <br />
    <li>
      <span>43. <span class="text-delta-green">Always report back to A-cell.</span></span>
      <br />
      <p class="pl-6">  Even if that means leaving your team to <span class="text-delta-green">die</span>. </p>
    </li>
    <br />
    <li>
      <p>44. <span class="text-delta-green">If you are successful, you won't have to explain your actions to A-Cell.</span></p>
      <br />
      <p class="pl-6">  A-Cell will be the final arbiter of <span class="text-delta-green">your success</span>. </p>
    </li>
  </ol>
  <br />
  <br />
</Typewriter>

{#if showFrom}
--<LoopDecode />
{/if}
