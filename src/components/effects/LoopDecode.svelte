<svelte:options runes={true} />

<script lang="ts">
	import { blur } from 'svelte/transition';
	import { decode, keysAreSameLength } from '../../modules/decode';
	import { randomChar } from '../../modules/scrambleUtils';
	import axiomsData from '$data/axioms.json';

	type LoopDecodeProps = {
		startingText?: string;
		keys?: string[];
		fadeFor?: number;
	};

	let {
		startingText = randomChar(6),
		keys = axiomsData.signature.names,
		fadeFor = 10
	}: LoopDecodeProps = $props();

	let currentText = $state('');
	let finished = $state(false);
	let keyToDecode = $state(0);
	let shownFinishedFor = $state(0);
	let fadedFor = $state(0);
	const keyLength = $derived(keys[0]?.length ?? 0);

	$effect(() => {
		currentText = startingText;
	});

	export const loopDecode = (str: string, decodeKeys: Array<string>) => {
		if (!decodeKeys.length) return str;

		if (!keysAreSameLength(decodeKeys)) {
			throw new TypeError('All keys must be the same length of characters!');
		}

		if (keyToDecode >= decodeKeys.length) {
			keyToDecode = 0;
		}

		let key = decodeKeys[keyToDecode].toLowerCase();

		if (str === '\xa0' && fadedFor < fadeFor) {
			// Fading between words
			fadedFor = fadedFor + 1;
			return '\xa0';
		}

		if (fadedFor === fadeFor) {
			shownFinishedFor = 0;
			fadedFor = 0;
			finished = false;
			str = randomChar(keyLength);

			if (keyToDecode === decodeKeys.length - 1) {
				keyToDecode = 0;
			} else {
				keyToDecode = keyToDecode + 1;
			}

			key = decodeKeys[keyToDecode].toLowerCase();
		}

		if (str === key) {
			// String matches, start fade and wipe
			if (shownFinishedFor < 100) {
				shownFinishedFor = shownFinishedFor + 1;
				return str;
			}
			if (shownFinishedFor === 100) return '\xa0';
		}

		const decodedStr = decode(str, key);
		if (decodedStr === key) finished = true;
		return decodedStr;
	};

	$effect(() => {
		const decodeKeys = keys;

		if (!decodeKeys.length) {
			return;
		}

		const interval = setInterval(() => {
			currentText = loopDecode(currentText, decodeKeys);
		}, 20);

		return () => clearInterval(interval);
	});
</script>

<div>
	{#if finished}
		<span transition:blur={{ amount: 8 }} class="capitalize"> {currentText} </span>
	{:else}
		<span> {currentText} </span>
	{/if}
</div>
