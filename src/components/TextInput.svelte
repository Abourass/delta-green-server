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
		inputClasses = 'terminal-input',
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
			class={`${inputClasses} w-40 sm:w-52`}
			{autocomplete}
			{name}
			{placeholder}
			{required}
		/>
	</label>
</div>

<style>
	label {
		font-size: 1.25rem;
		gap: 0.5rem;
		align-items: center;
	}

	input {
		font-size: 1.05rem;
		color: #dffff0;
		padding-left: 0.45rem;
		height: 32px;
		border-radius: 2px;
		border: 1px solid rgba(76, 124, 94, 0.52);
		background: rgba(2, 8, 5, 0.85);
	}

	input:focus-visible {
		outline: none;
		border-color: #44ff7a;
		box-shadow: 0 0 0 1px rgba(68, 255, 122, 0.45);
	}
</style>
