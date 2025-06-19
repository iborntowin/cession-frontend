<!-- Modal Component -->
<script>
  import { createEventDispatcher } from 'svelte';

  export let title = '';
  export let show = false;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

{#if show}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    on:click={handleBackdropClick}
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <button
          class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          on:click={handleClose}
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  /* Add any component-specific styles here */
</style> 