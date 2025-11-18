<script lang="ts">
	export let value: string = '';
	export let label: string = 'Pass';
</script>

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

<div class="flex content-center">
	<label class="flex flex-row justify-between w-full times24">
		<span>{label}</span>
		<input type="password" bind:value class="w-44 bg-zinc-900" />
	</label>
</div>
