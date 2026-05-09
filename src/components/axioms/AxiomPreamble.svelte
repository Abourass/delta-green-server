<script lang="ts">
	import Typewriter from 'svelte-typewriter';
	import axiomsData from '$data/axioms.json';

	type AxiomPreambleProps = {
		onFinish?: () => void;
	};

	let { onFinish = () => {} }: AxiomPreambleProps = $props();
	let showButton = $state(false);

	// Content is trusted because it is bundled from local static axioms JSON.
	const trustedHtml = (html: string) => html;
</script>

<Typewriter cascade on:done={() => (showButton = true)}>
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
