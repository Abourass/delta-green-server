<script lang="typescript">
  import { user } from './stores/user';
  import Typewriter from 'svelte-typewriter';
  import LogInForm from './components/LogInForm.svelte';

  let showLogin = false, loggedIn = false, loading = false, loaded = false;
</script>

<style>
  :root {
    --cursor-color: white;
  }
</style>

<div class="h-screen w-full bg-black text-white text-opacity-90 flex justify-center">
  <div class="mt-14 w-9/12 md:w-9/12 lg:w-3/5 xl:w-2/5 flex flex-col items-center">
    {#if loggedIn}
      <Typewriter interval={47} on:done={() => loading = true}>
        <h1 class="text-3xl mb-5">Welcome <span class="text-delta-green">{$user}</span> to the <span class="text-5xl text-delta-green">Δ</span> Secure Server</h1>
      </Typewriter>

      {#if loading}
        <Typewriter interval={80} on:done={() => setTimeout(() => {loading = false; loaded = true}, 380)}>
          <h3 class="text-xl">Files unlocking...</h3>
        </Typewriter>
      {/if}

      {#if loaded}
        <Typewriter cascade>
          <span class="text-delta-green"> Edward, </span>
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
          <span class="text-delta-green"> ALPHONSE'S AXIOMS FOR AGENTS </span>
          <ol>
            <li>
              <span>1. The first commandment is, Thou shall not get caught.</span>
              <br />
              <span class="pl-6">  You do not have a "get out of jail free" card. You do not have a license to kill. </span>
              <br />
              <span class="pl-6">  To the world outside Delta Green, you are a criminal, a terrorist and a traitor.</span>
              <br />
              <span class="pl-6">  If you are arrested, you will keep quiet, say nothing and take what's coming.</span>
              <br />
              <span class="pl-6">  Getting you out of custody is not A-cell's problem, unless A-cell needs you for something</span>
            </li>
          </ol>
        </Typewriter>
      {/if}

    {:else} <!-- Not Logged in -->
      <Typewriter interval={47} on:done={() => showLogin = true}>
        <h1 class="text-3xl">Welcome to the <span class="text-5xl text-delta-green">Δ</span> Secure Server v24.8</h1>
      </Typewriter>

      {#if showLogin}
        <div class="md:w-3/4 lg:w-2/4 xl:w-2/5">
          <LogInForm bind:loggedIn={loggedIn} />
        </div>

      {/if}
    {/if}
  </div>
</div>
