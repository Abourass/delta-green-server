<script lang="ts">
	import Typewriter from 'svelte-typewriter';

	type DecryptingProps = {
		onFinish?: () => void;
		reduceMotion?: boolean;
	};

	let { onFinish = () => {}, reduceMotion = false }: DecryptingProps = $props();
	const decryptingInterval = $derived(reduceMotion ? 1 : 80);
</script>

<Typewriter interval={decryptingInterval} on:done={onFinish}>
	<h3 class="text-2xl times24">Files decrypting...</h3>
</Typewriter>
