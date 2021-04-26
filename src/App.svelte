<script lang="typescript">
  import { user } from './stores/user';
  import Typewriter from 'svelte-typewriter';
  import LogInForm from './components/LogInForm.svelte';

  let showLogin = false, loggedIn = false;
</script>

<div class="h-screen w-full bg-black text-white text-opacity-90 flex justify-center">
  <div class="mt-14 w-3/5 flex flex-col items-center">
    {#if loggedIn}
      <Typewriter interval={47}>
        <h1 class="text-3xl">Welcome <span class="text-delta-green">{$user}</span> to the <span class="text-5xl text-delta-green">Δ</span> Secure Server</h1>
      </Typewriter>

    {:else} <!-- Not Logged in -->
      <Typewriter interval={47} on:done={() => showLogin = true}>
        <h1 class="text-3xl">Welcome to the <span class="text-5xl text-delta-green">Δ</span> Secure Server v24.8</h1>
      </Typewriter>

      {#if showLogin}
        <LogInForm bind:loggedIn={loggedIn} />
      {/if}
    {/if}
  </div>
</div>
