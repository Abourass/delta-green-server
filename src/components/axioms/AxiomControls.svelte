<script lang="ts">
  export let lastFn;
  export let nextFn;
</script>

<div class="flex flex-row justify-around w-2/3 mt-4">
  <button
    type="button"
    class="rounded bg-gray-700 text-xl p-2 border border-light-blue-500 border-opacity-25"
    on:click={lastFn}
  >
              <span class="text-md text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                </svg>
              </span>
  </button>

  <button
    type="button"
    class="rounded bg-gray-700 text-xl p-2 border border-light-blue-500 border-opacity-25"
    on:click={nextFn}
  >
              <span class="text-md text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
  </button>
</div>
