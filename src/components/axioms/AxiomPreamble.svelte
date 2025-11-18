<script lang="ts">
	import Typewriter from 'svelte-typewriter';
	import axiomsData from '$data/axioms.json';

	export let onFinish: () => void;

	let showButton = false;
</script>

<Typewriter cascade on:done={() => (showButton = true)}>
	{#each axiomsData.preamble.lines as line}
		<p class="text-center pb-4">{@html line}</p>
	{/each}

	<ul class="flex flex-col justify-center items-center pb-4">
		<p class="text-delta-green">It all comes back to the same old mission:</p>
		{#each axiomsData.preamble.mission as item}
			<li>{item}</li>
		{/each}
	</ul>
</Typewriter>

{#if showButton}
	<button
		type="button"
		class="rounded bg-slate-700 text-xl p-2 border border-blue-300 border-opacity-25 hover:border-delta-green"
		on:click={onFinish}
	>
		Open Attachment
		<span class="text-md text-gray-400">(Axioms.txt)</span>
	</button>
{/if}
