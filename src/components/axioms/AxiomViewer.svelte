<script lang="ts">
	import { onMount } from 'svelte';
	import Typewriter from 'svelte-typewriter';
	import AxiomControls from './AxiomControls.svelte';
	import LoopDecode from '../effects/LoopDecode.svelte';
	import axiomsData from '$data/axioms.json';

	export let page: number = 1;
	export let onNext: () => void;
	export let onPrev: () => void;

	const AXIOMS_PER_PAGE = 5;

	$: startIdx = (page - 1) * AXIOMS_PER_PAGE;
	$: endIdx = Math.min(startIdx + AXIOMS_PER_PAGE, axiomsData.axioms.length);
	$: pageAxioms = axiomsData.axioms.slice(startIdx, endIdx);
	$: isLastPage = page === 9;

	let showTitle = false;
	let showAxioms = false;
	let showSignature = false;

	// Reset display states when page changes
	$: if (page) {
		showTitle = false;
		showAxioms = false;
		showSignature = false;
		setTimeout(() => {
			showTitle = true;
		}, 0);
	}
</script>

{#if showTitle}
	<Typewriter cascade on:done={() => (showAxioms = true)}>
		<span class="text-delta-green text-lg"> ALPHONSE'S AXIOMS FOR AGENTS </span>
	</Typewriter>
{/if}

{#if showAxioms}
	<Typewriter cascade interval={20} on:done={() => isLastPage && (showSignature = true)}>
		<br />
		<ol>
			{#each pageAxioms as axiom}
				<li>
					<p>
						{axiom.number}. <span class="text-delta-green">{axiom.title}</span>
					</p>
					{#if axiom.content.length > 0}
						<br />
						{#each axiom.content as line}
							<p class="pl-6">{@html line}</p>
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

	<AxiomControls lastFn={onPrev} nextFn={onNext} />
{/if}
