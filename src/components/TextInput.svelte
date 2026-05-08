<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type TextInputProps = {
		value?: string;
		label?: string;
		type?: 'text' | 'password' | 'email' | 'search' | 'url';
		inputClasses?: string;
		labelClasses?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		name?: string;
		placeholder?: string;
		required?: boolean;
	};

	let {
		value = $bindable(''),
		label = '',
		type = 'text',
		inputClasses = 'bg-zinc-900',
		labelClasses = '',
		autocomplete = 'off',
		name = '',
		placeholder = '',
		required = false
	}: TextInputProps = $props();
</script>

<div class="flex content-center">
	<label class={`${labelClasses} flex flex-row justify-between w-full times24`}>
		<span>{label}</span>
		<input
			{type}
			bind:value
			class={`${inputClasses} w-44`}
			{autocomplete}
			{name}
			{placeholder}
			{required}
		/>
	</label>
</div>

<style>
	label {
		font-size: 1.5rem;
	}

	input {
		font-size: 1.2rem;
		color: black;
		padding-left: 0.4rem;
		height: 26px;
		border-radius: 2px;
		margin-top: auto;
		margin-bottom: auto;
		margin-left: 0.2rem;
	}
</style>
