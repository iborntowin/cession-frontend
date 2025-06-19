<script>
  import { onMount } from 'svelte';
  import { cessionsApi, clientsApi, documentsApi } from '$lib/api';
  import { showAlert, loading } from '$lib/stores';
  import { format } from 'date-fns';
  import { redirect } from '@sveltejs/kit';
  
  export let data;
  
  let client = null;
  let cessions = [];
  let searchTerm = '';
  let statusFilter = 'all';
  
  // Filtered cessions based on search term and status
  $: filteredCessions = cessions
    .filter(cession => 
      statusFilter === 'all' || cession.status.toLowerCase() === statusFilter.toLowerCase()
    )
    .filter(cession => 
      cession.bankOrAgency.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  onMount(async () => {
    if (!data.id || data.id === 'undefined' || data.id === 'new') {
      showAlert('Cannot load cessions for an invalid client.', 'error');
      return;
    }
    await loadClient();
    await loadCessions();
  });
  
  async function loadClient() {
    $loading = true;
    try {
      client = await clientsApi.getById(data.id);
      if (!client) {
        showAlert('Client not found for cessions page.', 'error');
      }
    } catch (error) {
      showAlert(error.message || 'Failed to load client details for cessions page', 'error');
    } finally {
      $loading = false;
    }
  }
  
  async function loadCessions() {
    $loading = true;
    try {
      cessions = await cessionsApi.getByClientId(data.id);
    } catch (error) {
      showAlert(error.message || 'Failed to load cessions', 'error');
    } finally {
      $loading = false;
    }
  }
  
  async function deleteCession(id) {
    if (!confirm('Are you sure you want to delete this cession?')) {
      return;
    }
    
    $loading = true;
    try {
      await cessionsApi.delete(id);
      showAlert('Cession deleted successfully', 'success');
      cessions = cessions.filter(cession => cession.id !== id);
    } catch (error) {
      showAlert(error.message || 'Failed to delete cession', 'error');
    } finally {
      $loading = false;
    }
  }
  
  function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy');
  }
</script>

<script context="module">
  export function load({ params }) {
    if (!params.id || params.id === 'undefined' || params.id === 'new') {
      throw redirect(307, '/clients'); // Redirect to clients list if ID is invalid
    }
    return {
      id: params.id
    };
  }
</script>

<svelte:head>
  <title>Client Cessions | Cession Management</title>
</svelte:head>

<div>
  <div class="flex justify-between items-center mb-6">
    <div>
      <a href={`/clients/${data.id}`} class="text-primary-600 hover:text-primary-800 mb-2 inline-block">
        &larr; Back to Client Details
      </a>
      <h1 class="text-2xl font-bold text-gray-800">
        {client ? `${client.fullName}'s Cessions` : 'Client Cessions'}
      </h1>
    </div>
    
    {#if client}
      <a href={`/clients/${data.id}/cessions/new`} class="btn btn-primary">Add New Cession</a>
    {/if}
  </div>
  
  {#if client}
    <div class="card mb-6">
      <h2 class="text-lg font-semibold mb-2">Client Information</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500">Full Name</p>
          <p class="font-medium">{client.fullName}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">CIN (ID Number)</p>
          <p class="font-medium">{client.cin}</p>
        </div>
      </div>
    </div>
  {/if}
  
  <div class="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
    <div class="flex-grow">
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="Search by bank or agency..."
        class="input"
      />
    </div>
    
    <div class="flex-shrink-0">
      <select bind:value={statusFilter} class="input">
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="finished">Finished</option>
        <option value="pending">Pending</option>
      </select>
    </div>
  </div>
  
  {#if $loading && cessions.length === 0}
    <div class="text-center py-8">
      <p>Loading cessions...</p>
    </div>
  {:else if filteredCessions.length === 0}
    <div class="bg-gray-50 rounded-lg p-8 text-center">
      <p class="text-gray-600">
        No cessions found. {searchTerm || statusFilter !== 'all' ? 'Try different filters or ' : ''}
        Add a new cession to get started.
      </p>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white rounded-lg overflow-hidden shadow">
        <thead class="bg-gray-100 text-gray-700">
          <tr>
            <th class="py-3 px-4 text-left">Bank/Agency</th>
            <th class="py-3 px-4 text-left">Amount</th>
            <th class="py-3 px-4 text-left">Monthly</th>
            <th class="py-3 px-4 text-left">Start Date</th>
            <th class="py-3 px-4 text-left">Status</th>
            <th class="py-3 px-4 text-left">Remaining</th>
            <th class="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each filteredCessions as cession}
            <tr class="hover:bg-gray-50">
              <td class="py-3 px-4">{cession.bankOrAgency}</td>
              <td class="py-3 px-4">{formatCurrency(cession.totalLoanAmount)}</td>
              <td class="py-3 px-4">{formatCurrency(cession.monthlyDeduction)}</td>
              <td class="py-3 px-4">{formatDate(cession.startDate)}</td>
              <td class="py-3 px-4">
                <span class={`badge badge-${cession.status.toLowerCase()}`}>
                  {cession.status}
                </span>
              </td>
              <td class="py-3 px-4">
                {cession.remainingBalance !== null ? formatCurrency(cession.remainingBalance) : 'N/A'}
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex justify-center space-x-2">
                  <a href={`/clients/${data.id}/cessions/${cession.id}`} class="text-primary-600 hover:text-primary-800">View</a>
                  <a href={`/clients/${data.id}/cessions/${cession.id}/edit`} class="text-secondary-600 hover:text-secondary-800">Edit</a>
                  <button 
                    on:click={() => deleteCession(cession.id)} 
                    class="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
