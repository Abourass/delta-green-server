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

	const isTypingTarget = (target: EventTarget | null) => {
		if (!(target instanceof HTMLElement)) {
			return false;
		}

		const tag = target.tagName;
		return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
	};

	$effect(() => {
		const onKeydown = (event: KeyboardEvent) => {
			if (isTypingTarget(event.target)) {
				return;
			}

			const key = event.key.toLowerCase();

			if (isAxioms && (event.key === 'ArrowRight' || key === 'l')) {
				event.preventDefault();
				nextPage();
				return;
			}

			if (isAxioms && (event.key === 'ArrowLeft' || key === 'j')) {
				event.preventDefault();
				prevPage();
				return;
			}

			if (isNavigation && key === 'c') {
				event.preventDefault();
				handleCorrespondence();
				return;
			}

			if (!isLogin && !isWelcome && key === 'h') {
				event.preventDefault();
				handleLogoClick();
			}
		};

		window.addEventListener('keydown', onKeydown);

		return () => window.removeEventListener('keydown', onKeydown);
	});
</script>

<main class="bbs-shell">
	<section class="terminal-panel w-[92%] max-w-4xl px-5 py-8 sm:px-10 sm:py-10">
		<div class="terminal-status mb-5">
			<span>NODE DG-SRV-24 // LINK SECURE</span>
			<span class="terminal-status__right">MODE // {appState.toUpperCase()}</span>
		</div>

		<div class="flex flex-col items-center">
			{#if isLogin}
				<Typewriter interval={47}>
					<h1 class="text-2xl sm:text-3xl text-center">
						Welcome to the <span class="text-5xl text-delta-green terminal-logo">Δ</span> Secure Server
						v24.8
					</h1>
				</Typewriter>
				<div class="w-full max-w-lg mt-8">
					<LogInForm onLogin={handleLogin} />
				</div>
			{:else if isWelcome}
				<Typewriter interval={47} on:done={handleWelcomeDone}>
					<h1 class="text-2xl sm:text-3xl text-center mb-5">
						Welcome <span class="text-delta-green times24">{$user}</span> to the
						<span class="text-5xl text-delta-green terminal-logo">Δ</span>
						Secure Server
					</h1>
				</Typewriter>
			{:else}
				<h1 class="text-2xl sm:text-3xl text-center mb-5">
					Welcome <span class="text-delta-green times32">{$user}</span> to the
					<button
						type="button"
						class="text-5xl text-delta-green cursor-pointer terminal-logo"
						aria-label="Return to command index"
						onclick={handleLogoClick}
					>
						Δ
					</button>
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

				<p class="terminal-help mt-4 text-center">HOTKEY // PRESS H TO RETURN TO COMMAND INDEX</p>
			{/if}
		</div>
	</section>
</main>

<style>
	.terminal-logo {
		text-shadow: 0 0 12px rgba(68, 255, 122, 0.55);
	}
</style>
