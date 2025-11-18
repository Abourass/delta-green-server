<script lang="ts">
	import { writable } from 'svelte/store';
	import Typewriter from 'svelte-typewriter';
	import LogInForm from './components/LogInForm.svelte';
	import Decrypting from './components/Decrypting.svelte';
	import Navigation from './components/Navigation.svelte';
	import AxiomPreamble from './components/axioms/AxiomPreamble.svelte';
	import AxiomViewer from './components/axioms/AxiomViewer.svelte';
	import { user } from './stores/user';

	type AppState = 'login' | 'welcome' | 'decrypting' | 'navigation' | 'preamble' | 'axioms';

	const state = writable<AppState>('login');
	let currentPage = 1;
	const totalPages = 9;

	const handleLogin = () => {
		state.set('welcome');
	};

	const handleWelcomeDone = () => {
		state.set('decrypting');
	};

	const handleDecryptingDone = () => {
		setTimeout(() => state.set('navigation'), 380);
	};

	const handleCorrespondence = () => {
		state.set('preamble');
	};

	const handlePreambleDone = () => {
		state.set('axioms');
	};

	const handleLogoClick = () => {
		currentPage = 1;
		state.set('navigation');
	};

	const nextPage = () => {
		currentPage = currentPage === totalPages ? 1 : currentPage + 1;
	};

	const prevPage = () => {
		currentPage = currentPage === 1 ? totalPages : currentPage - 1;
	};
</script>

<style>
	:global(*) {
		--cursor-color: white !important;
		background-color: color-mix(in lch, rgb(10, 10, 10) 40%, rgb(5, 5, 5));
		color: white;
	}

	:global(input) {
		color: white !important;
	}
</style>

<main class="h-screen w-full text-white text-opacity-90 flex justify-center">
	<div class="mt-14 w-9/12 lg:w-3/5 xl:w-2/5 flex flex-col items-center">
		{#if $state === 'login'}
			<Typewriter interval={47} on:done={() => ($state = 'login')}>
				<h1 class="text-3xl">
					Welcome to the <span class="text-5xl text-delta-green">Δ</span> Secure Server v24.8
				</h1>
			</Typewriter>
			<div class="md:w-3/4 lg:w-2/4 xl:w-2/5 mt-8">
				<LogInForm on:login={handleLogin} />
			</div>
		{:else if $state === 'welcome'}
			<Typewriter interval={47} on:done={handleWelcomeDone}>
				<h1 class="text-3xl mb-5">
					Welcome <span class="text-delta-green times24">{$user}</span> to the
					<span class="text-5xl text-delta-green cursor-pointer">Δ</span>
					Secure Server
				</h1>
			</Typewriter>
		{:else}
			<h1 class="text-3xl mb-5">
				Welcome <span class="text-delta-green times32">{$user}</span> to the
				<button class="text-5xl text-delta-green cursor-pointer" on:click={handleLogoClick}
					>Δ</button
				>
				Secure Server
			</h1>

			{#if $state === 'decrypting'}
				<Decrypting onFinish={handleDecryptingDone} />
			{:else if $state === 'navigation'}
				<Navigation correspondenceFn={handleCorrespondence} />
			{:else if $state === 'preamble'}
				<AxiomPreamble onFinish={handlePreambleDone} />
			{:else if $state === 'axioms'}
				<AxiomViewer page={currentPage} onNext={nextPage} onPrev={prevPage} />
			{/if}
		{/if}
	</div>
</main>
