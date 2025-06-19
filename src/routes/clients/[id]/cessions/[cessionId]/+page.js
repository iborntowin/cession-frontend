import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { getAuthHeaders } from '$lib/api';
import { redirect } from '@sveltejs/kit';

export async function load({ params, fetch }) {
    // Validate parameters
    if (!params.id || params.id === 'undefined' || !params.cessionId || params.cessionId === 'undefined') {
        throw redirect(303, '/clients');
    }

    try {
        // Load client data
        const clientResponse = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/clients/${params.id}`, {
            headers: getAuthHeaders()
        });
        
        if (!clientResponse.ok) {
            throw new Error('Failed to load client data');
        }
        
        const client = await clientResponse.json();
        
        // Load cession data
        const cessionResponse = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/cessions/${params.cessionId}`, {
            headers: getAuthHeaders()
        });
        
        if (!cessionResponse.ok) {
            throw new Error('Failed to load cession data');
        }
        
        const cession = await cessionResponse.json();
        
        return {
            client,
            cession,
            clientId: params.id,
            cessionId: params.cessionId
        };
    } catch (error) {
        console.error('Error loading page data:', error);
        throw redirect(303, '/clients');
    }
} 