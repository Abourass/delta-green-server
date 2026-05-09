<script lang="ts">
	import Typewriter from 'svelte-typewriter';
	import axiomsData from '$data/axioms.json';

	type AxiomPreambleProps = {
		onFinish?: () => void;
		reduceMotion?: boolean;
	};

	let { onFinish = () => {}, reduceMotion = false }: AxiomPreambleProps = $props();
	let showButton = $state(false);
	const preambleInterval = $derived(reduceMotion ? 1 : 28);

	// Content is trusted because it is bundled from local static axioms JSON.
	const trustedHtml = (html: string) => html;
</script>

<Typewriter cascade interval={preambleInterval} on:done={() => (showButton = true)}>
	{#each axiomsData.preamble.lines as line, lineIdx (`line-${lineIdx}`)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<p class="text-center pb-4">{@html trustedHtml(line)}</p>
	{/each}

	<ul class="flex flex-col justify-center items-center pb-4">
		<p class="text-delta-green">It all comes back to the same old mission:</p>
		{#each axiomsData.preamble.mission as item, missionIdx (`mission-${missionIdx}`)}
			<li>{item}</li>
		{/each}
	</ul>
</Typewriter>

{#if showButton}
	<button type="button" class="terminal-button text-xl" onclick={onFinish}>
		Open Attachment
		<span class="text-sm text-(--terminal-dim)">(Axioms.txt)</span>
	</button>
{/if}
