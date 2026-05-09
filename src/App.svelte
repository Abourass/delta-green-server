<script lang="ts">
	import Typewriter from 'svelte-typewriter';
	import LogInForm from '$components/LogInForm.svelte';
	import Decrypting from '$components/Decrypting.svelte';
	import Navigation from '$components/Navigation.svelte';
	import CrtOverlay from '$components/effects/CrtOverlay.svelte';
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

	type CrtIntensity = 'off' | 'low' | 'high';
	type CrtRenderer = 'css' | 'webgl';

	type TerminalSettings = {
		crtIntensity: CrtIntensity;
		flicker: boolean;
		keyclick: boolean;
		reducedMotion: boolean;
	};

	const SETTINGS_STORAGE_KEY = 'dg-terminal-tuning-v1';
	const DEFAULT_TERMINAL_SETTINGS: TerminalSettings = {
		crtIntensity: 'high',
		flicker: true,
		keyclick: false,
		reducedMotion: false
	};

	const isCrtIntensity = (value: unknown): value is CrtIntensity =>
		value === 'off' || value === 'low' || value === 'high';

	type WindowWithWebkitAudioContext = Window & {
		webkitAudioContext?: typeof AudioContext;
	};

	let appState = $state<AppFlowState>(INITIAL_APP_FLOW_STATE);
	let currentPage = $state(FIRST_AXIOM_PAGE);
	let showSettings = $state(false);
	let settingsLoaded = $state(false);
	let terminalSettings = $state<TerminalSettings>({ ...DEFAULT_TERMINAL_SETTINGS });
	let crtRenderer = $state<CrtRenderer>('css');
	let audioContext: AudioContext | null = null;
	const totalPages = TOTAL_AXIOM_PAGES;
	const headingInterval = $derived(terminalSettings.reducedMotion ? 1 : 47);
	const decryptTransitionDelayMs = $derived(terminalSettings.reducedMotion ? 0 : 380);
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
		}, decryptTransitionDelayMs);
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

	const toggleSettingsPanel = () => {
		showSettings = !showSettings;
	};

	const setCrtIntensity = (crtIntensity: CrtIntensity) => {
		terminalSettings.crtIntensity = crtIntensity;
	};

	const setFlicker = (event: Event) => {
		terminalSettings.flicker = (event.currentTarget as HTMLInputElement).checked;
	};

	const setKeyclick = (event: Event) => {
		terminalSettings.keyclick = (event.currentTarget as HTMLInputElement).checked;
	};

	const setReducedMotion = (event: Event) => {
		terminalSettings.reducedMotion = (event.currentTarget as HTMLInputElement).checked;
	};

	const handleRendererChange = (nextRenderer: CrtRenderer) => {
		crtRenderer = nextRenderer;
	};

	const playKeyClick = () => {
		if (!terminalSettings.keyclick || typeof window === 'undefined') {
			return;
		}

		const AudioContextCtor =
			window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext;
		if (!AudioContextCtor) {
			return;
		}

		if (!audioContext) {
			try {
				audioContext = new AudioContextCtor();
			} catch {
				return;
			}
		}

		if (!audioContext) {
			return;
		}

		if (audioContext.state === 'suspended') {
			void audioContext.resume();
		}

		const now = audioContext.currentTime;
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.type = 'square';
		oscillator.frequency.setValueAtTime(1100 + Math.random() * 120, now);
		gainNode.gain.setValueAtTime(0.001, now);
		gainNode.gain.exponentialRampToValueAtTime(0.022, now + 0.003);
		gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);
		oscillator.start(now);
		oscillator.stop(now + 0.032);
	};

	$effect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		try {
			const savedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
			if (savedSettings) {
				const parsed = JSON.parse(savedSettings) as Partial<TerminalSettings>;

				if (isCrtIntensity(parsed.crtIntensity)) {
					terminalSettings.crtIntensity = parsed.crtIntensity;
				}

				if (typeof parsed.flicker === 'boolean') {
					terminalSettings.flicker = parsed.flicker;
				}

				if (typeof parsed.keyclick === 'boolean') {
					terminalSettings.keyclick = parsed.keyclick;
				}

				if (typeof parsed.reducedMotion === 'boolean') {
					terminalSettings.reducedMotion = parsed.reducedMotion;
				}
			}
		} catch {
			// Ignore malformed settings payloads and keep defaults.
		} finally {
			settingsLoaded = true;
		}
	});

	$effect(() => {
		if (typeof window === 'undefined' || !settingsLoaded) {
			return;
		}

		const payload: TerminalSettings = {
			crtIntensity: terminalSettings.crtIntensity,
			flicker: terminalSettings.flicker,
			keyclick: terminalSettings.keyclick,
			reducedMotion: terminalSettings.reducedMotion
		};

		window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
	});

	$effect(() => {
		if (typeof document === 'undefined') {
			return;
		}

		document.body.dataset.crtIntensity = terminalSettings.crtIntensity;
		document.body.dataset.crtRenderer = crtRenderer;
		document.body.dataset.flicker = terminalSettings.flicker ? 'on' : 'off';
		document.body.dataset.motion = terminalSettings.reducedMotion ? 'reduced' : 'full';
	});

	$effect(() => {
		if (typeof window === 'undefined' || !terminalSettings.keyclick) {
			return;
		}

		const onKeydown = (event: KeyboardEvent) => {
			if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
				return;
			}
			playKeyClick();
		};

		const onPointerDown = (event: PointerEvent) => {
			if (event.button !== 0) {
				return;
			}
			playKeyClick();
		};

		window.addEventListener('keydown', onKeydown, { passive: true });
		window.addEventListener('pointerdown', onPointerDown, { passive: true });

		return () => {
			window.removeEventListener('keydown', onKeydown);
			window.removeEventListener('pointerdown', onPointerDown);
		};
	});

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

			if (key === 't') {
				event.preventDefault();
				toggleSettingsPanel();
				return;
			}

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
	<CrtOverlay
		intensity={terminalSettings.crtIntensity}
		flicker={terminalSettings.flicker}
		reducedMotion={terminalSettings.reducedMotion}
		onRendererChange={handleRendererChange}
	/>

	<section class="terminal-panel w-[92%] max-w-4xl px-5 py-8 sm:px-10 sm:py-10">
		<div class="terminal-status mb-5">
			<span>NODE DG-SRV-24 // LINK SECURE</span>
			<div class="terminal-status__meta">
				<span class="terminal-status__right">MODE // {appState.toUpperCase()}</span>
				<button
					type="button"
					class="terminal-status__button"
					aria-controls="terminal-tuning"
					aria-expanded={showSettings}
					onclick={toggleSettingsPanel}
				>
					TUNING {showSettings ? '[OPEN]' : '[CLOSED]'}
				</button>
			</div>
		</div>

		{#if showSettings}
			<section
				id="terminal-tuning"
				class="terminal-tuning mb-5"
				aria-label="Terminal authenticity controls"
			>
				<div class="terminal-tuning__row">
					<span class="terminal-tuning__label">CRT Intensity</span>
					<div class="terminal-segment" role="group" aria-label="CRT intensity">
						<button
							type="button"
							class={`terminal-segment__option ${terminalSettings.crtIntensity === 'off' ? 'is-active' : ''}`}
							onclick={() => setCrtIntensity('off')}
						>
							Off
						</button>
						<button
							type="button"
							class={`terminal-segment__option ${terminalSettings.crtIntensity === 'low' ? 'is-active' : ''}`}
							onclick={() => setCrtIntensity('low')}
						>
							Low
						</button>
						<button
							type="button"
							class={`terminal-segment__option ${terminalSettings.crtIntensity === 'high' ? 'is-active' : ''}`}
							onclick={() => setCrtIntensity('high')}
						>
							High
						</button>
					</div>
				</div>

				<div class="terminal-tuning__row terminal-tuning__row--grid">
					<label class="terminal-check">
						<input type="checkbox" checked={terminalSettings.flicker} onchange={setFlicker} />
						<span>Screen Flicker</span>
					</label>

					<label class="terminal-check">
						<input type="checkbox" checked={terminalSettings.keyclick} onchange={setKeyclick} />
						<span>Keyclick Audio</span>
					</label>

					<label class="terminal-check">
						<input
							type="checkbox"
							checked={terminalSettings.reducedMotion}
							onchange={setReducedMotion}
						/>
						<span>Reduced Motion</span>
					</label>
				</div>

				<p class="terminal-help mt-2 text-center">HOTKEY // PRESS T TO TOGGLE TERMINAL TUNING</p>
			</section>
		{/if}

		<div class="flex flex-col items-center">
			{#if isLogin}
				<Typewriter interval={headingInterval}>
					<h1 class="text-2xl sm:text-3xl text-center">
						Welcome to the <span class="text-5xl text-delta-green terminal-logo">Δ</span> Secure Server
						v24.8
					</h1>
				</Typewriter>
				<div class="w-full max-w-lg mt-8">
					<LogInForm onLogin={handleLogin} />
				</div>
			{:else if isWelcome}
				<Typewriter interval={headingInterval} on:done={handleWelcomeDone}>
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
					<Decrypting
						onFinish={handleDecryptingDone}
						reduceMotion={terminalSettings.reducedMotion}
					/>
				{:else if isNavigation}
					<Navigation onCorrespondence={handleCorrespondence} />
				{:else if isPreamble}
					<AxiomPreamble
						onFinish={handlePreambleDone}
						reduceMotion={terminalSettings.reducedMotion}
					/>
				{:else if isAxioms}
					<AxiomViewer
						page={currentPage}
						onNext={nextPage}
						onPrev={prevPage}
						reduceMotion={terminalSettings.reducedMotion}
					/>
				{/if}

				<p class="terminal-help mt-4 text-center">HOTKEY // H COMMAND INDEX | T TUNING PANEL</p>
			{/if}
		</div>
	</section>
</main>

<style>
	.terminal-logo {
		text-shadow: 0 0 12px rgba(68, 255, 122, 0.55);
	}
</style>
