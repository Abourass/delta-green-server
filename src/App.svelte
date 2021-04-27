<script lang="typescript">
  import {user} from './stores/user';
  import Typewriter from 'svelte-typewriter';
  import LogInForm from './components/LogInForm.svelte';
  import AxiomPreamble from './components/axioms/AxiomPreamble.svelte';
  import Navigation from './components/Navigation.svelte';
  import Decrypting from './components/Decrypting.svelte';
  import AxiomControls from './components/axioms/AxiomControls.svelte';
  import AxiomOneThroughFive from './components/axioms/AxiomOneThroughFive.svelte';
  import AxiomSixThroughTen from './components/axioms/AxiomSixThroughTen.svelte';

  let showLogin = false,
    loggedIn = false,
    loading = false,
    navigationOpen = false,
    axiomPreambleOpen = false,
    axiomReadBtnAvailable = false,
    axiomsOpen = false,
    axiom = 1,
    showAxioms = false;

  const lastAxiom = () => {
    if (axiom === 1) {
      axiom = 4;
    } else {
      axiom = axiom - 1;
    }
  }

  const nextAxiom = () => {
    if (axiom === 4) {
      axiom = 1
    } else {
      axiom = axiom + 1;
    }
  }
</script>

<style>
  :root {
    --cursor-color: white;
  }

  button:disabled {
    background: #d0cece;
    color: black;
  }
</style>

<div class="h-screen w-full bg-black text-white text-opacity-90 flex justify-center">
  <div class="mt-14 w-9/12 md:w-9/12 lg:w-3/5 xl:w-2/5 flex flex-col items-center">
    {#if loggedIn}
      <Typewriter interval={47} on:done={() => loading = true}>
        <h1 class="text-3xl mb-5">Welcome <span class="text-delta-green">{$user}</span> to the <span class="text-5xl text-delta-green">Δ</span> Secure Server</h1>
      </Typewriter>

      {#if loading}
        <Decrypting onFinish={() => setTimeout(() => { loading = false; navigationOpen = true }, 380)} />
      {/if}

      {#if navigationOpen}
        <Navigation
          correspondenceFn={() => { axiomPreambleOpen = true; navigationOpen = false }}
        />
      {/if}

      {#if axiomPreambleOpen}
        <AxiomPreamble onFinish={() => {axiomReadBtnAvailable = true}} />

        {#if axiomReadBtnAvailable}
          <button
            type="button"
            class="rounded bg-gray-700 text-xl p-2 border border-light-blue-500 border-opacity-25"
            on:click={() => {axiomPreambleOpen = false; axiomsOpen = true;}}
          >
            Open Attachment
            <span class="text-md text-gray-400">(Axioms.txt)</span>
          </button>
        {/if}
      {/if}

      {#if axiomsOpen}
        <Typewriter cascade on:done={() => {showAxioms = true}}>
          <span class="text-delta-green"> ALPHONSE'S AXIOMS FOR AGENTS </span>
        </Typewriter>

        {#if showAxioms}
          {#if axiom === 1} <AxiomOneThroughFive /> {/if}
          {#if axiom === 2} <AxiomSixThroughTen /> {/if}
          {#if axiom === 3} <AxiomOneThroughFive /> {/if}
          {#if axiom === 4} <AxiomSixThroughTen /> {/if}
        {/if}

        <AxiomControls
          lastFn={lastAxiom}
          nextFn={nextAxiom}
        />
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
