<script lang="ts">
  import { page } from '$app/stores';
  import { clientsApi, workplacesApi, jobsApi } from '$lib/api';
  import { onMount } from 'svelte';
  import { showToast } from '$lib/toast';
  import { browser } from '$app/environment';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { showAlert, loading } from '$lib/stores';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Spinner from '$lib/components/Spinner.svelte';
  import { t } from '$lib/i18n';

  export let data;

  let client = null;
  let isLoading = true;
  let isSaving = false;
  let workplaces = [];
  let jobs = [];
  let filteredJobs = [];
  let selectedWorkplaceId = null;

  let formData = {
    fullName: '',
    cin: null,
    job: '',
    phoneNumber: '',
    workplace: '',
    address: '',
    jobId: null,
    workplaceId: null,
    workerNumber: ''
  };

  onMount(async () => {
    if (!data.client) {
      showAlert($t('clients.edit.not_found'), 'error');
      goto('/clients');
      return;
    }

    try {
      // Load workplaces and jobs
      const [workplacesResponse, jobsResponse] = await Promise.all([
        workplacesApi.getAll(),
        jobsApi.getAll()
      ]);
      workplaces = workplacesResponse;
      jobs = jobsResponse;

      client = data.client;
      formData = {
        fullName: client.fullName,
        cin: client.cin,
        job: client.job || '',
        phoneNumber: client.phoneNumber || '',
        workplace: client.workplace || '',
        address: client.address || '',
        jobId: client.jobId,
        workplaceId: client.workplaceId,
        workerNumber: client.workerNumber ? String(client.workerNumber) : ''
      };

      // Set selected workplace and filter jobs
      if (client.workplaceId) {
        selectedWorkplaceId = client.workplaceId;
        filteredJobs = jobs.filter(job => job.workplaceId === client.workplaceId);
      }

      isLoading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert($t('clients.edit.load_error'), 'error');
      isLoading = false;
    }
  });

  // Update filtered jobs when workplace is selected
  $: if (selectedWorkplaceId) {
    filteredJobs = jobs.filter(job => job.workplaceId === selectedWorkplaceId);
    // Reset job selection if the current job is not in the filtered list
    if (formData.jobId && !filteredJobs.some(job => job.id === formData.jobId)) {
      formData.jobId = null;
    }
  } else {
    filteredJobs = [];
    formData.jobId = null;
  }

  // Handle workplace selection
  function handleWorkplaceChange(event) {
    const workplaceId = event.target.value;
    selectedWorkplaceId = workplaceId || null;
    formData.workplaceId = workplaceId || null;
    
    // Set address automatically based on selected workplace
    if (workplaceId) {
      const selectedWorkplace = workplaces.find(w => w.id === workplaceId);
      if (selectedWorkplace) {
        formData.address = selectedWorkplace.name;
      }
    }
  }

  // Handle job selection
  function handleJobChange(event) {
    const jobId = event.target.value;
    formData.jobId = jobId || null;
  }

  async function handleSubmit() {
    if (!formData.fullName || !formData.cin) {
      showAlert($t('clients.edit.required_fields'), 'error');
      return;
    }
    if (formData.cin < 10000000 || formData.cin > 99999999) {
      showAlert($t('clients.edit.cin_validation'), 'error');
      return;
    }
    if (!formData.workerNumber || !/^\d{10}$/.test(formData.workerNumber)) {
      showAlert('Le numéro d\'employé doit comporter exactement 10 chiffres.', 'error');
      return;
    }

    isSaving = true;
    try {
      await clientsApi.update(client.id, formData);
      showAlert($t('clients.edit.success'), 'success');
      goto(`/clients/${client.id}`);
    } catch (error) {
      showAlert(error.message || $t('clients.edit.error'), 'error');
    } finally {
      isSaving = false;
    }
  }
</script>

<svelte:head>
  <title>{$t('clients.edit.title')} | {$t('common.app_name')}</title>
</svelte:head>

<div class="space-y-6">
  <PageHeader 
    title={$t('clients.edit.title')} 
    subtitle={$t('clients.edit.subtitle')}
    actions={[
      {
        label: $t('clients.edit.back_to_client'),
        href: `/clients/${client?.id}`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>`
      }
    ]}
  />

  {#if isLoading}
    <div class="flex justify-center py-12">
      <Spinner isLoading={true} size="lg" />
    </div>
  {:else}
    <div class="max-w-2xl mx-auto">
      <div class="bg-white shadow-sm rounded-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">{$t('clients.edit.client_info')}</h3>
        </div>
        <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-6">
          <div class="space-y-4">
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700">
                {$t('clients.edit.full_name')} {$t('clients.edit.required_field')}
              </label>
              <input
                type="text"
                id="fullName"
                bind:value={formData.fullName}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label for="cin" class="block text-sm font-medium text-gray-700">
                {$t('clients.edit.cin')} {$t('clients.edit.required_field')}
              </label>
              <input
                type="number"
                id="cin"
                bind:value={formData.cin}
                min="10000000"
                max="99999999"
                on:input={() => { formData.cin = formData.cin ? parseInt(formData.cin) : null; }}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label for="workplace" class="block text-sm font-medium text-gray-700">{$t('clients.edit.workplace')}</label>
              <select
                id="workplace"
                value={selectedWorkplaceId}
                on:change={handleWorkplaceChange}
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">{$t('clients.edit.select_workplace')}</option>
                {#each workplaces as workplace}
                  <option value={workplace.id}>{workplace.name}</option>
                {/each}
              </select>
            </div>

            <div>
              <label for="job" class="block text-sm font-medium text-gray-700">{$t('clients.edit.job')}</label>
              <select
                id="job"
                value={formData.jobId}
                on:change={handleJobChange}
                disabled={!selectedWorkplaceId}
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">{$t('clients.edit.select_job')}</option>
                {#each filteredJobs as job}
                  <option value={job.id}>{job.name}</option>
                {/each}
              </select>
            </div>

            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700">{$t('clients.edit.phone')}</label>
              <input
                type="tel"
                id="phoneNumber"
                bind:value={formData.phoneNumber}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label for="address" class="block text-sm font-medium text-gray-700">{$t('clients.edit.address')}</label>
              <input
                type="text"
                id="address"
                bind:value={formData.address}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                readonly={selectedWorkplaceId !== null}
              />
            </div>

            <div>
              <label for="workerNumber" class="block text-sm font-medium text-gray-700">
                {$t('clients.edit.worker_number') || 'Numéro d\'employé'}
              </label>
              <input
                type="text"
                id="workerNumber"
                bind:value={formData.workerNumber}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              on:click={() => goto(`/clients/${client.id}`)}
            >
              {$t('clients.edit.cancel')}
            </button>
            <button
              type="submit"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={isSaving}
            >
              {#if isSaving}
                <Spinner isLoading={true} size="sm" className="mr-2" />
                {$t('clients.edit.saving')}
              {:else}
                {$t('clients.edit.save_changes')}
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>
