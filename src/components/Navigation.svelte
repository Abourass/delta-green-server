<script lang="ts">
	type NavigationProps = {
		onCorrespondence?: () => void;
	};

	let { onCorrespondence = () => {} }: NavigationProps = $props();
</script>

<div class="w-full h-28">
	<div class="flex flex-row justify-around items-center h-full">
		<button
			type="button"
			class="rounded bg-slate-700 text-xl p-2 border border-blue-300 border-opacity-25 hover:border-delta-green"
			onclick={onCorrespondence}
		>
			Pinned Correspondence
			<span class="text-md text-gray-400">(1)</span>
		</button>

		<button
			type="button"
			class="rounded bg-slate-700 text-xl p-2 border border-blue-300 border-opacity-25 hover:border-delta-green"
		>
			Private Messages
			<span class="text-md bg-opacity-100">(0)</span>
		</button>
	</div>
</div>
