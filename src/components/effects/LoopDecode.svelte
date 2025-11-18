<script lang="ts">
	import { onMount } from 'svelte';
	import { blur } from 'svelte/transition';
	import { writable } from 'svelte/store';
	import { decode, keysAreSameLength } from '../../modules/decode';
	import { randomChar } from '../../modules/scrambleUtils';
	import axiomsData from '$data/axioms.json';

	export let startingText = randomChar(6);
	export let keys = axiomsData.signature.names;
	export let fadeFor = 10;

	let finished = false;
	let keyToDecode = writable(0);
	let shownFinishedFor = writable(0);
	let fadedFor = writable(0);
	let length = writable(keys[0].length);

	export const loopDecode = (str: string, decodeKeys: Array<string>) => {
		if (!keysAreSameLength(decodeKeys))
			throw new TypeError('All keys must be the same length of characters!');

		let key = decodeKeys[$keyToDecode].toLowerCase();

		if (str === '\xa0' && $fadedFor < fadeFor) {
			// Fading between words
			$fadedFor = $fadedFor + 1;
			return '\xa0';
		}

		if ($fadedFor === fadeFor) {
			$shownFinishedFor = 0;
			$fadedFor = 0;
			finished = false;
			str = randomChar($length);

			if ($keyToDecode === decodeKeys.length - 1) {
				$keyToDecode = 0;
			} else {
				$keyToDecode = $keyToDecode + 1;
			}

			key = decodeKeys[$keyToDecode].toLowerCase();
		}

		if (str === key) {
			// String matches, start fade and wipe
			if ($shownFinishedFor < 100) {
				$shownFinishedFor = $shownFinishedFor + 1;
				return str;
			}
			if ($shownFinishedFor === 100) return '\xa0';
		}

		const decodedStr = decode(str, key);
		if (decodedStr === key) finished = true;
		return decodedStr;
	};

	onMount(() => {
		const interval = setInterval(() => {
			startingText = loopDecode(startingText, keys);
		}, 20);

		return () => clearInterval(interval);
	});
</script>

<div>
	{#if finished}
		<span transition:blur={{ amount: 8 }} class="capitalize"> {startingText} </span>
	{:else}
		<span> {startingText} </span>
	{/if}
</div>
