<script>
	import {user} from '../stores/user';
  import Typewriter from 'svelte-typewriter';
  import LogInForm from '../components/LogInForm.svelte';
  import AxiomPreamble from '../components/axioms/AxiomPreamble.svelte';
  import Navigation from '../components/Navigation.svelte';
  import Decrypting from '../components/Decrypting.svelte';
  import AxiomControls from '../components/axioms/AxiomControls.svelte';
  import AxiomOneThroughFive from '../components/axioms/AxiomOneThroughFive.svelte';
  import AxiomSixThroughTen from '../components/axioms/AxiomSixThroughTen.svelte';
  import AxiomElevenThroughFifteen from '../components/axioms/AxiomElevenThroughFifteen.svelte';
  import AxiomSixteenThroughTwenty from '../components/axioms/AxiomSixteenThroughTwenty.svelte';
  import AxiomTwentyOneThroughTwentyFive from '../components/axioms/AxiomTwentyOneThroughTwentyFive.svelte';
  import AxiomTwentySixThroughThirty from '../components/axioms/AxiomTwentySixThroughThirty.svelte';
  import AxiomThirtyOneThroughThirtyFive from '../components/axioms/AxiomThirtyOneThroughThirtyFive.svelte';
  import AxiomThirtySixThoughFourty from '../components/axioms/AxiomThirtySixThoughFourty.svelte';
  import AxiomFourtyOneThroughFortyFour from '../components/axioms/AxiomFourtyOneThroughFortyFour.svelte';

  let showLogin = false,
    showTypedHeader = true,
    loggedIn = false,
    loading = false,
    navigationOpen = false,
    axiomPreambleOpen = false,
    axiomReadBtnAvailable = false,
    axiomsOpen = false,
    axiom = 1,
    showAxioms = false;

  const jumpToNavigation = () => {
    if (loading) loading = false;
    if (axiomPreambleOpen) axiomPreambleOpen = false;
    if (axiomReadBtnAvailable) axiomReadBtnAvailable = false;
    if (axiomsOpen) axiomsOpen = false;
    if (showAxioms) showAxioms = false;
    axiom = 1;
    navigationOpen = true;
  }

  const lastAxiom = () => {
    if (axiom === 1) {
      axiom = 9;
    } else {
      axiom = axiom - 1;
    }
  };

  const nextAxiom = () => {
    if (axiom === 9) {
      axiom = 1;
    } else {
      axiom = axiom + 1;
    }
  };
</script>

<svelte:head>
	<title>Secure Server v24.8 </title>
	<meta name="description" content="Scientia Mors Est" />
</svelte:head>

<div class="mt-14 w-9/12 lg:w-3/5 xl:w-2/5 flex flex-col items-center">
{#if loggedIn === false}
  <Typewriter interval={47} on:done={() => showLogin = true}>
    <h1 class="text-3xl">Welcome to the <span class="text-5xl text-delta-green">Δ</span> Secure Server v24.8</h1>
  </Typewriter>

  {#if showLogin} <!-- Triggers once the welcome message is completed -->
    <div class="md:w-3/4 lg:w-2/4 xl:w-2/5">
      <LogInForm bind:loggedIn={loggedIn} />
    </div>
  {/if}
{:else}
  {#if showTypedHeader}
    <Typewriter interval={47} on:done={() => {loading = true; showTypedHeader = false;}}>
      <h1 class="text-3xl mb-5"> Welcome <span class="text-delta-green times24">{$user}</span> to the
        <span class="text-5xl text-delta-green cursor-pointer">Δ</span>
        Secure Server
      </h1>
    </Typewriter>
  {:else}
    <h1 class="text-3xl mb-5"> Welcome <span class="text-delta-green times32">{$user}</span> to the
      <button class="text-5xl text-delta-green cursor-pointer" on:click={jumpToNavigation}>Δ</button>
      Secure Server
    </h1>
  {/if}

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
        class="
        rounded
        bg-slate-700
        text-xl
        p-2
        border
        border-blue-300
        border-opacity-25
      hover:border-delta-green"
          on:click={() => {axiomPreambleOpen = false; axiomsOpen = true;}}
        >
        Open Attachment
        <span class="text-md text-gray-400">(Axioms.txt)</span>
      </button>
    {/if}
  {/if}

  {#if axiomsOpen} <!-- Triggers when they first open the axioms attachment -->
    <Typewriter cascade on:done={() => {showAxioms = true}}>
      <span class="text-delta-green text-lg"> ALPHONSE'S AXIOMS FOR AGENTS </span>
    </Typewriter>

    {#if showAxioms} <!-- Triggers after the title is displayed -->
      {#if axiom === 1} <AxiomOneThroughFive /> {/if}
      {#if axiom === 2} <AxiomSixThroughTen /> {/if}
      {#if axiom === 3} <AxiomElevenThroughFifteen /> {/if}
      {#if axiom === 4} <AxiomSixteenThroughTwenty /> {/if}
      {#if axiom === 5} <AxiomTwentyOneThroughTwentyFive /> {/if}
      {#if axiom === 6} <AxiomTwentySixThroughThirty /> {/if}
      {#if axiom === 7} <AxiomThirtyOneThroughThirtyFive /> {/if}
      {#if axiom === 8} <AxiomThirtySixThoughFourty /> {/if}
      {#if axiom === 9} <AxiomFourtyOneThroughFortyFour /> {/if}

      <AxiomControls lastFn={lastAxiom} nextFn={nextAxiom} />
    {/if}
  {/if}<!-- Not Logged in -->
{/if}
</div>
