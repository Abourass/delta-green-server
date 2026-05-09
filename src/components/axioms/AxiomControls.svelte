<script lang="ts">
	type AxiomControlsProps = {
		onPrev?: () => void;
		onNext?: () => void;
		page?: number;
		totalPages?: number;
	};

	let {
		onPrev = () => {},
		onNext = () => {},
		page = 1,
		totalPages = 1
	}: AxiomControlsProps = $props();
</script>

<div class="command-bar w-full">
	<div class="command-bar__group">
		<button type="button" class="command-key" aria-label="Previous page" onclick={onPrev}>
			<span aria-hidden="true">[←]</span>
			Prev
		</button>

		<button type="button" class="command-key" aria-label="Next page" onclick={onNext}>
			<span aria-hidden="true">[→]</span>
			Next
		</button>
	</div>

	<p class="command-indicator" aria-live="polite">Page {page}/{totalPages}</p>
	<p class="command-hint">Hotkeys: left or right to turn page, H for home</p>
</div>
