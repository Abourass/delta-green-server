<script lang="ts">
	type NavigationProps = {
		onCorrespondence?: () => void;
	};

	let { onCorrespondence = () => {} }: NavigationProps = $props();
</script>

<div class="w-full">
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
		<button type="button" class="terminal-button text-lg sm:text-xl" onclick={onCorrespondence}>
			Pinned Correspondence
			<span class="text-sm text-(--terminal-dim)">(1 NEW)</span>
		</button>

		<button
			type="button"
			class="terminal-button text-lg sm:text-xl"
			disabled
			aria-disabled="true"
			title="Private message relay is offline"
		>
			Private Messages
			<span class="text-sm text-(--terminal-dim)">(OFFLINE)</span>
		</button>
	</div>
	<p class="terminal-help mt-3 text-center">HOTKEY // PRESS C TO OPEN PINNED CORRESPONDENCE</p>
</div>
