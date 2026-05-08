<script lang="ts">
	import Typewriter from 'svelte-typewriter';
	import LogInForm from '$components/LogInForm.svelte';
	import Decrypting from '$components/Decrypting.svelte';
	import Navigation from '$components/Navigation.svelte';
	import AxiomPreamble from '$components/axioms/AxiomPreamble.svelte';
	import AxiomViewer from '$components/axioms/AxiomViewer.svelte';
	import {
		FIRST_AXIOM_PAGE,
		INITIAL_APP_FLOW_STATE,
		TOTAL_AXIOM_PAGES,
		nextWrappedPage,
		prevWrappedPage,
		transitionAppFlow,
		type AppFlowState
	} from './features/appFlow';
	import { user } from './stores/user';

	let appState = $state<AppFlowState>(INITIAL_APP_FLOW_STATE);
	let currentPage = $state(FIRST_AXIOM_PAGE);
	const totalPages = TOTAL_AXIOM_PAGES;
	const isLogin = $derived(appState === 'login');
	const isWelcome = $derived(appState === 'welcome');
	const isDecrypting = $derived(appState === 'decrypting');
	const isNavigation = $derived(appState === 'navigation');
	const isPreamble = $derived(appState === 'preamble');
	const isAxioms = $derived(appState === 'axioms');

	const handleLogin = () => {
		appState = transitionAppFlow(appState, 'loginSucceeded');
	};

	const handleWelcomeDone = () => {
		appState = transitionAppFlow(appState, 'welcomeCompleted');
	};

	const handleDecryptingDone = () => {
		setTimeout(() => {
			appState = transitionAppFlow(appState, 'decryptingCompleted');
		}, 380);
	};

	const handleCorrespondence = () => {
		appState = transitionAppFlow(appState, 'openCorrespondence');
	};

	const handlePreambleDone = () => {
		appState = transitionAppFlow(appState, 'openAxioms');
	};

	const handleLogoClick = () => {
		currentPage = FIRST_AXIOM_PAGE;
		appState = transitionAppFlow(appState, 'returnToNavigation');
	};

	const nextPage = () => {
		currentPage = nextWrappedPage(currentPage, totalPages);
	};

	const prevPage = () => {
		currentPage = prevWrappedPage(currentPage, totalPages);
	};
</script>

<main class="h-screen w-full text-white text-opacity-90 flex justify-center">
	<div class="mt-14 w-9/12 lg:w-3/5 xl:w-2/5 flex flex-col items-center">
		{#if isLogin}
			<Typewriter interval={47} on:done={() => (appState = 'login')}>
				<h1 class="text-3xl">
					Welcome to the <span class="text-5xl text-delta-green">Δ</span> Secure Server v24.8
				</h1>
			</Typewriter>
			<div class="md:w-3/4 lg:w-2/4 xl:w-2/5 mt-8">
				<LogInForm onLogin={handleLogin} />
			</div>
		{:else if isWelcome}
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
				<button class="text-5xl text-delta-green cursor-pointer" onclick={handleLogoClick}>Δ</button
				>
				Secure Server
			</h1>

			{#if isDecrypting}
				<Decrypting onFinish={handleDecryptingDone} />
			{:else if isNavigation}
				<Navigation onCorrespondence={handleCorrespondence} />
			{:else if isPreamble}
				<AxiomPreamble onFinish={handlePreambleDone} />
			{:else if isAxioms}
				<AxiomViewer page={currentPage} onNext={nextPage} onPrev={prevPage} />
			{/if}
		{/if}
	</div>
</main>

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
