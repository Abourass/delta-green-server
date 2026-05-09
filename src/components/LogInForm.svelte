<script lang="ts">
	import Agents from '../Agents';
	import { user, password } from '../stores/user';
	import TextInput from './TextInput.svelte';

	type LogInFormProps = {
		onLogin?: () => void;
	};

	let { onLogin = () => {} }: LogInFormProps = $props();
	const MAX_FAILED_ATTEMPTS = 3;
	const LOCKOUT_DURATION_MS = 8000;

	let failedAttempts = $state(0);
	let isLocked = $state(false);
	let statusType = $state<'idle' | 'error' | 'success'>('idle');
	let statusMessage = $state('AUTHORIZED PERSONNEL ONLY // ENTER CREDENTIALS');
	let lockTimer: ReturnType<typeof setTimeout> | undefined;

	const clearLockTimer = () => {
		if (lockTimer) {
			clearTimeout(lockTimer);
			lockTimer = undefined;
		}
	};

	$effect(() => {
		return () => clearLockTimer();
	});

	const login = (event: SubmitEvent) => {
		event.preventDefault();

		if (isLocked) {
			statusType = 'error';
			statusMessage = 'SECURITY LOCKOUT ACTIVE // WAIT FOR RESET';
			return;
		}

		const records = Agents.filter((agent) => agent.user === $user && agent.password === $password);

		if (records.length === 1) {
			statusType = 'success';
			statusMessage = 'ACCESS GRANTED // INITIALIZING SESSION';
			failedAttempts = 0;
			onLogin();
			return;
		}

		statusType = 'error';
		failedAttempts = failedAttempts + 1;
		password.set('');

		const attemptsRemaining = MAX_FAILED_ATTEMPTS - failedAttempts;
		if (attemptsRemaining <= 0) {
			isLocked = true;
			failedAttempts = 0;
			statusMessage = 'SECURITY LOCKOUT ENGAGED // RETRY IN 8 SECONDS';

			clearLockTimer();
			lockTimer = setTimeout(() => {
				isLocked = false;
				statusType = 'idle';
				statusMessage = 'AUTHORIZED PERSONNEL ONLY // ENTER CREDENTIALS';
			}, LOCKOUT_DURATION_MS);
			return;
		}

		statusMessage = `ACCESS DENIED // ${attemptsRemaining} ATTEMPT${attemptsRemaining === 1 ? '' : 'S'} REMAINING`;
	};
</script>

<form
	class="w-full px-4 sm:px-8 pt-8 pb-6 rounded-md border border-[rgba(76,124,94,0.52)] bg-black/35 flex flex-col justify-center"
	onsubmit={login}
	aria-describedby="login-status"
>
	<TextInput
		label="User"
		bind:value={$user}
		labelClasses="mb-2"
		autocomplete="username"
		name="username"
		required
	/>
	<TextInput
		type="password"
		label="Pass"
		bind:value={$password}
		autocomplete="current-password"
		name="password"
		required
	/>
	<p
		id="login-status"
		class={`mt-3 text-center text-sm tracking-wider ${statusType === 'error' ? 'text-red-300' : statusType === 'success' ? 'text-emerald-200' : 'text-[color:var(--terminal-dim)]'}`}
		aria-live="polite"
	>
		{statusMessage}
	</p>
	<button type="submit" disabled={isLocked} class="terminal-button mt-3 w-32 mx-auto text-xl">
		{isLocked ? 'Locked' : 'Log In'}
	</button>
</form>
