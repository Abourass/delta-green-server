<script lang="ts">
  export let correspondenceFn;
</script>

<div class="w-full h-28">
  <div class="flex flex-row justify-around items-center h-full">
    <button
      type="button"
      class="rounded bg-gray-700 text-xl p-2 border border-light-blue-500 border-opacity-25"
      on:click={correspondenceFn}
    >
      Pinned Correspondence
      <span class="text-md text-gray-400">(1)</span>
    </button>

    <button
      type="button"
      class="rounded bg-gray-700 text-xl p-2 border border-light-blue-500 border-opacity-25"
    >
      Private Messages
      <span class="text-md text-gray-500">(0)</span>
    </button>
  </div>
</div>
