<script lang="ts">
	import Typewriter from 'svelte-typewriter';
	import AxiomControls from './AxiomControls.svelte';
	import LoopDecode from '../effects/LoopDecode.svelte';
	import axiomsData from '$data/axioms.json';

	type AxiomViewerProps = {
		page?: number;
		onNext: () => void;
		onPrev: () => void;
	};

	const { axioms } = axiomsData;
	let { page = 1, onNext, onPrev }: AxiomViewerProps = $props();

	const AXIOMS_PER_PAGE = 5;
	const TOTAL_PAGES = Math.ceil(axioms.length / AXIOMS_PER_PAGE);

	// Content is trusted because it is bundled from local static axioms JSON.
	const trustedHtml = (html: string) => html;

	const startIdx = $derived((page - 1) * AXIOMS_PER_PAGE);
	const endIdx = $derived(Math.min(startIdx + AXIOMS_PER_PAGE, axioms.length));
	const pageAxioms = $derived(axioms.slice(startIdx, endIdx));
	const isLastPage = $derived(page === TOTAL_PAGES);

	let showTitle = $state(false);
	let showAxioms = $state(false);
	let showSignature = $state(false);

	$effect(() => {
		if (!page) {
			return;
		}

		showTitle = false;
		showAxioms = false;
		showSignature = false;

		const timeoutId = setTimeout(() => {
			showTitle = true;
		}, 0);

		return () => clearTimeout(timeoutId);
	});
</script>

{#if showTitle}
	<Typewriter cascade on:done={() => (showAxioms = true)}>
		<span class="text-delta-green text-lg"> ALPHONSE'S AXIOMS FOR AGENTS </span>
	</Typewriter>
{/if}

{#if showAxioms}
	<Typewriter cascade interval={20} on:done={() => isLastPage && (showSignature = true)}>
		<br />
		<ol class="axiom-list">
			{#each pageAxioms as axiom (axiom.number)}
				<li>
					<p>
						{axiom.number}. <span class="text-delta-green">{axiom.title}</span>
					</p>
					{#if axiom.content.length > 0}
						<br />
						{#each axiom.content as line, lineIdx (`${axiom.number}-${lineIdx}`)}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							<p class="pl-6">{@html trustedHtml(line)}</p>
							<br />
						{/each}
					{/if}
				</li>
				<br />
			{/each}
		</ol>
		{#if isLastPage}
			<br />
			<br />
		{/if}
	</Typewriter>

	{#if isLastPage && showSignature}
		--<LoopDecode />
	{/if}

	<AxiomControls {onPrev} {onNext} />
{/if}

<style>
	.axiom-list :global(.text-delta-green) {
		font-weight: 700;
	}
</style>
