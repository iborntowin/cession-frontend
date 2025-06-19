import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { getAuthHeaders, clientsApi } from '$lib/api';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
    console.log('Client Page - Loading client data for ID:', params.id);

    if (!params.id || params.id === 'undefined' || params.id === 'new') {
        throw redirect(307, '/clients');
    }

    try {
        // Use clientsApi.getById for proper authentication
        const clientResult = await clientsApi.getById(params.id);
        if (!clientResult.success) {
            throw new Error(clientResult.error || 'Failed to load client');
        }
        const client = clientResult.data;

        // Load client's cessions
        const cessionsResponse = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/cessions/client/${params.id}`, {
            headers: getAuthHeaders()
        });

        const cessions = cessionsResponse.ok ? await cessionsResponse.json() : [];

        return {
            id: params.id,
            client,
            cessions
        };
    } catch (error) {
        console.error('Client Page - Error loading client:', error);
        return {
            id: params.id,
            error: error.message
        };
    }
} 