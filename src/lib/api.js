import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { clearAuth, showAlert, token, setAuth } from './stores';
import { page } from '$app/stores';
import { get } from 'svelte/store';

// Flag to track if we're already handling an auth error
let isHandlingAuthError = false;
let redirectTimeout = null;

// Base API handling
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let responseData;
  
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }
  
  if (response.status === 401 || response.status === 403) {
    if (browser && !isHandlingAuthError) {
      isHandlingAuthError = true;
      if (redirectTimeout) clearTimeout(redirectTimeout);
      console.warn('handleResponse: 401/403 detected, calling clearAuth() and redirecting to /login');
      showAlert('Your session has expired or authentication is required. Please log in again.', 'error');
      clearAuth();
      goto('/login');
      
      // Reset the flag after a short delay to allow for re-authentication attempts
      redirectTimeout = setTimeout(() => {
        isHandlingAuthError = false;
      }, 2000);
    }
    throw new Error(responseData?.message || `Authentication failed with status ${response.status}`);
  }
  
  // For 400/422/other errors, show error but do NOT clear token or logout
  if (!response.ok) {
    if (typeof responseData === 'object' && responseData.message) {
      showAlert(responseData.message, 'error');
      throw new Error(responseData.message);
    }
    showAlert(responseData || `API request failed with status ${response.status}`, 'error');
    throw new Error(responseData || `API request failed with status ${response.status}`);
  }
  
  return responseData;
};

// Get authentication headers
export const getAuthHeaders = () => {
  const currentToken = get(token);
  
  if (!currentToken) {
    throw new Error('No authentication token found');
  }
  
  return {
    'Authorization': `Bearer ${currentToken}`,
    'Content-Type': 'application/json'
  };
};

// Client API
export const clientsApi = {
  getAll: async () => {
    const headers = getAuthHeaders();
    console.log('Clients API - getAll headers:', headers);
    const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/clients`, {
      headers: headers
    });
    return handleResponse(response);
  },
  
  search: async (name, job, clientNumber, cin, phoneNumber, workplace, address, workerNumber) => {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (job) params.append('job', job);
    if (clientNumber) params.append('clientNumber', clientNumber);
    if (cin) params.append('cin', cin);
    if (phoneNumber) params.append('phoneNumber', phoneNumber);
    if (workplace) params.append('workplace', workplace);
    if (address) params.append('address', address);
    if (workerNumber) params.append('workerNumber', workerNumber);
    
    const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/clients/search?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  getById: async (id) => {
    try {
      if (!id || id === 'undefined') {
        throw new Error('Invalid client ID');
      }
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/clients/${id}`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Client API - getById error:', error);
      return { success: false, error: error.message };
    }
  },
  
  create: async (client) => {
    try {
      console.log('Client API - Creating client:', client);
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/clients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(client)
      });
      
      const data = await handleResponse(response);
      console.log('Client API - Create response:', data);
      
      if (!data || !data.id) {
        throw new Error('Invalid response from server: missing client ID');
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Client API - Create error:', error);
      return { success: false, error: error.message };
    }
  },
  
  update: async (id, client) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/clients/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(client)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Client API - Update error:', error);
      return { success: false, error: error.message };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/clients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.status === 204) {
        return { success: true };
      }
      await handleResponse(response);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Cession API
export const cessionsApi = {
  getAll: async () => {
    const headers = getAuthHeaders();
    console.log('Cessions API - getAll headers:', headers);
    const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/cessions`, {
      headers: headers
    });
    return handleResponse(response);
  },
  
  search: async (name, job, clientNumber, clientCin, status, phoneNumber, workplace, address, jobId) => {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (job) params.append('job', job);
    if (clientNumber) params.append('clientNumber', clientNumber);
    if (clientCin) params.append('clientCin', clientCin.toString());
    if (status) params.append('status', status);
    if (phoneNumber) params.append('phoneNumber', phoneNumber);
    if (workplace) params.append('workplace', workplace);
    if (address) params.append('address', address);
    if (jobId) params.append('jobId', jobId.toString());
    const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/cessions/search?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  getById: async (id) => {
    const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/cessions/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  getByClientId: async (clientId) => {
    const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/cessions/client/${clientId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  create: async (cession) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/cessions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cession)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  update: async (id, cession) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/cessions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cession)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/cessions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.status === 204) {
        return { success: true };
      }
      await handleResponse(response);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Auth API
export const authApi = {
  login: async (email, password) => {
    try {
      console.log('Auth API - Attempting login with:', { email });
      const response = await fetch(`${PUBLIC_BACKEND_URL}/v1/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      console.log('Auth API - Login response status:', response.status);
      const data = await handleResponse(response);
      console.log('Auth API - Login response data:', data);
      
      if (data && data.token) {
        console.log('Auth API - Login successful, token received');
        setAuth(data.token, {
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          role: data.role
        });
        return { success: true, data };
      } else {
        console.log('Auth API - Login failed, no token in response');
        return { success: false, error: data.message || 'Invalid response from server or no token received' };
      }
    } catch (error) {
      console.error('Auth API - Login error:', error);
      return { success: false, error: error.message };
    }
  },
  
  signup: async (email, password, firstName, lastName) => {
    try {
      console.log('Auth API - Attempting signup with:', { email });
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password, firstName, lastName })
      });
      console.log('Auth API - Signup response status:', response.status);
      const data = await handleResponse(response);
      console.log('Auth API - Signup response data:', data);

      if (data && typeof data.token === 'string' && typeof data.email === 'string' && typeof data.fullName === 'string' && typeof data.role === 'string') {
        console.log('Auth API - Signup successful, received valid AuthResponse');
        setAuth(data.token, {
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          role: data.role
        });
        return { success: true, data };
      } else {
        console.log('Auth API - Signup failed, response did not contain expected AuthResponse structure or token');
        return { success: false, error: data?.message || 'Invalid response structure from server after signup.' };
      }
    } catch (error) {
      console.error('Auth API - Signup error:', error);
      const errorMessage = error.message || 'An unexpected error occurred during signup.';
      return { success: false, error: errorMessage };
    }
  },
  
  logout: () => {
    console.warn('authApi.logout: calling clearAuth()');
    clearAuth();
    return { success: true };
  },
  
  validateToken: async () => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/auth/validate`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      if (data && data.user) {
        setAuth(get(token), {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
          role: data.user.role
        });
      }
      return { success: true };
    } catch (error) {
      console.warn('validateToken: error detected, calling clearAuth()');
      clearAuth();
      return { success: false, error: error.message };
    }
  }
};

// Document API
export const documentsApi = {
  upload: async (clientId, documentType, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const headers = getAuthHeaders();
      delete headers['Content-Type']; // Let browser set it for FormData
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/documents/client/${clientId}/${documentType}`, {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Documents API - upload error:', error);
      return { success: false, error: error.message };
    }
  },
  
  uploadSpecific: async (clientId, clientNumber, documentType, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      if (clientNumber) {
        formData.append('clientNumber', clientNumber);
      }
      const headers = getAuthHeaders();
      delete headers['Content-Type'];
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/documents/client/${clientId}/specific`, {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Documents API - upload specific error:', error);
      return { success: false, error: error.message };
    }
  },
  
  getByClientId: async (clientId) => {
    const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/documents/client/${clientId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  getByCessionId: async (cessionId) => {
    const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/documents/cession/${cessionId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  delete: async (documentId) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/documents/${documentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.status === 204) {
        return { success: true };
      }
      await handleResponse(response); // Handle any errors
      return { success: true };
    } catch (error) {
      console.error('Documents API - delete error:', error);
      return { success: false, error: error.message };
    }
  },

  uploadDocument: async (file, type, entityId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('entityId', entityId);
      const headers = getAuthHeaders();
      delete headers['Content-Type'];
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/documents/upload`, {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Documents API - Upload error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Workplace API
export const workplacesApi = {
  getAll: async () => {
    const response = await fetch(`${PUBLIC_BACKEND_URL}/api/workplaces`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  create: async (workplace) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/workplaces`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(workplace)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/workplaces/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.status === 204) {
        return { success: true };
      }
      await handleResponse(response);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Payment API
export const paymentsApi = {
  create: async (paymentData) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  update: async (id, paymentData) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/payments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/payments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.status === 204) {
        return { success: true };
      }
      await handleResponse(response);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getCessionPayments: async (cessionId) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/payments/cession/${cessionId}`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getPaymentsByDateRange: async (cessionId, startDate, endDate) => {
    try {
      if (!cessionId || cessionId === 'null' || cessionId === 'undefined') {
        throw new Error('Invalid cession ID');
      }

      const params = new URLSearchParams({
        startDate,
        endDate
      });
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/payments/cession/${cessionId}/date-range?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Payment API - getPaymentsByDateRange error:', error);
      return { success: false, error: error.message };
    }
  },

  getAllPayments: async () => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/payments`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Payment API - getAllPayments error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Job API
export const jobsApi = {
  getAll: async () => {
    const response = await fetch(`${PUBLIC_BACKEND_URL}/api/jobs`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  create: async (job) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/jobs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(job)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/jobs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.status === 204) {
        return { success: true };
      }
      await handleResponse(response);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Products/Inventory API
export const productsApi = {
  getAll: async () => {
    try {
      console.log('Products API - Getting all products');
      const headers = getAuthHeaders();
      console.log('Products API - Request headers:', headers);
      
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/products`, {
        headers: headers
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Products API - getAll error:', error);
      return { success: false, error: error.message };
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/products/${id}`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Products API - getById error:', error);
      return { success: false, error: error.message };
    }
  },

  create: async (product) => {
    try {
      console.log('Products API - Creating product:', product);
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      };
      console.log('Products API - Request headers:', headers);
      
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/products`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(product)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Products API - create error:', error);
      return { success: false, error: error.message };
    }
  },

  update: async (id, product) => {
    try {
      console.log('Products API - Updating product:', { id, product });
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      };
      console.log('Products API - Request headers:', headers);
      
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/products/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(product)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Products API - update error:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id) => {
    try {
      console.log('Products API - Deleting product:', id);
      const headers = getAuthHeaders();
      console.log('Products API - Request headers:', headers);
      
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/products/${id}`, {
        method: 'DELETE',
        headers: headers
      });
      if (response.status === 204) {
        return { success: true };
      }
      await handleResponse(response);
      return { success: true };
    } catch (error) {
      console.error('Products API - delete error:', error);
      return { success: false, error: error.message };
    }
  },

  search: async (query) => {
    try {
      console.log('Products API - Searching products:', query);
      const headers = getAuthHeaders();
      console.log('Products API - Request headers:', headers);
      
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/products/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          ...headers,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Products API - search error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    try {
      console.log('Categories API - Getting all categories');
      const headers = getAuthHeaders();
      console.log('Categories API - Request headers:', headers);
      
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/categories`, {
        headers: headers
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Categories API - getAll error:', error);
      return { success: false, error: error.message };
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/categories/${id}`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Categories API - getById error:', error);
      return { success: false, error: error.message };
    }
  },

  create: async (category) => {
    try {
      console.log('Categories API - Creating category:', category);
      const headers = getAuthHeaders();
      console.log('Categories API - Request headers:', headers);
      
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/categories`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(category)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Categories API - create error:', error);
      return { success: false, error: error.message };
    }
  },

  update: async (id, category) => {
    try {
      console.log('Categories API - Updating category:', { id, category });
      const headers = getAuthHeaders();
      console.log('Categories API - Request headers:', headers);
      
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/categories/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(category)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Categories API - update error:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id) => {
    try {
      console.log('Categories API - Deleting category:', id);
      const headers = getAuthHeaders();
      console.log('Categories API - Request headers:', headers);
      
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/categories/${id}`, {
        method: 'DELETE',
        headers: headers
      });
      if (response.status === 204) {
        return { success: true };
      }
      await handleResponse(response);
      return { success: true };
    } catch (error) {
      console.error('Categories API - delete error:', error);
      return { success: false, error: error.message };
    }
  }
};

export const stockMovementsApi = {
  create: async (data) => {
    const params = new URLSearchParams();
    params.append('productId', data.productId);
    params.append('quantity', data.quantity);
    params.append('sellingPrice', data.sellingPrice);
    if (data.notes) params.append('notes', data.notes);
    const headers = getAuthHeaders();
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/stock-movements/record`, {
      method: 'POST',
      headers,
      body: params
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    return { success: true, data: await response.json() };
  },

  getRecent: async (type = 'OUTBOUND', limit = 5) => {
    try {
      console.log('Stock Movements API - Getting recent movements:', { type, limit });
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      params.append('limit', limit.toString());
      const headers = getAuthHeaders();
      headers['Accept'] = 'application/json';
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/stock-movements/recent?${params.toString()}`, {
        headers
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stock Movements API - Error response:', errorText);
        throw new Error(`Failed to fetch stock movements: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Stock Movements API - Received data:', data);
      return { 
        success: true, 
        data: data.map(movement => ({
          ...movement,
          productName: movement.productName || movement.product?.name || 'Unknown Product',
          sellingPriceAtSale: movement.sellingPriceAtSale || 0,
          purchasePriceAtSale: movement.purchasePrice || 0,
          quantity: movement.quantity,
          createdAt: movement.createdAt
        }))
      };
    } catch (error) {
      console.error('Stock Movements API - getRecent error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Financial Tracking API
export const financialApi = {
  createExpense: async (expense) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(expense)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - createExpense error:', error);
      return { success: false, error: error.message };
    }
  },

  getExpensesByMonth: async (userId, year, month) => {
    try {
      const response = await fetch(
        `${PUBLIC_BACKEND_URL}/api/v1/expenses?userId=${userId}&year=${year}&month=${month}`,
        {
          headers: getAuthHeaders()
        }
      );
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - getExpensesByMonth error:', error);
      return { success: false, error: error.message };
    }
  },

  getExpensesByDateRange: async (userId, startDate, endDate, page = 0, size = 10) => {
    try {
      const response = await fetch(
        `${PUBLIC_BACKEND_URL}/api/v1/expenses/range?userId=${userId}&startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`,
        {
          headers: getAuthHeaders()
        }
      );
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - getExpensesByDateRange error:', error);
      return { success: false, error: error.message };
    }
  },

  getAllExpenses: async (userId, page = 0, size = 10) => {
    try {
      const response = await fetch(
        `${PUBLIC_BACKEND_URL}/api/v1/expenses/all?userId=${userId}&page=${page}&size=${size}`,
        {
          headers: getAuthHeaders()
        }
      );
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - getAllExpenses error:', error);
      return { success: false, error: error.message };
    }
  },

  getExpensesByCategory: async (userId, year, month) => {
    try {
      const response = await fetch(
        `${PUBLIC_BACKEND_URL}/api/v1/expenses/categories?userId=${userId}&year=${year}&month=${month}`,
        {
          headers: getAuthHeaders()
        }
      );
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - getExpensesByCategory error:', error);
      return { success: false, error: error.message };
    }
  },

  deleteExpense: async (id) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/expenses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await handleResponse(response);
      return { success: true };
    } catch (error) {
      console.error('Financial API - deleteExpense error:', error);
      return { success: false, error: error.message };
    }
  },

  updateExpense: async (id, expense) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/expenses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(expense)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - updateExpense error:', error);
      return { success: false, error: error.message };
    }
  },

  createIncome: async (income) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/incomes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(income)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - createIncome error:', error);
      return { success: false, error: error.message };
    }
  },

  getIncomesByMonth: async (userId, year, month) => {
    try {
      const response = await fetch(
        `${PUBLIC_BACKEND_URL}/api/v1/incomes?userId=${userId}&year=${year}&month=${month}`,
        {
          headers: getAuthHeaders()
        }
      );
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - getIncomesByMonth error:', error);
      return { success: false, error: error.message };
    }
  },

  getIncomesByDateRange: async (userId, startDate, endDate, page = 0, size = 10) => {
    try {
      const response = await fetch(
        `${PUBLIC_BACKEND_URL}/api/v1/incomes/range?userId=${userId}&startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`,
        {
          headers: getAuthHeaders()
        }
      );
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - getIncomesByDateRange error:', error);
      return { success: false, error: error.message };
    }
  },

  getAllIncomes: async (userId, page = 0, size = 10) => {
    try {
      const response = await fetch(
        `${PUBLIC_BACKEND_URL}/api/v1/income/all?userId=${userId}&page=${page}&size=${size}`,
        {
          headers: getAuthHeaders()
        }
      );
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - getAllIncomes error:', error);
      return { success: false, error: error.message };
    }
  },

  getIncomesBySource: async (userId, year, month) => {
    try {
      const response = await fetch(
        `${PUBLIC_BACKEND_URL}/api/v1/income/sources?userId=${userId}&year=${year}&month=${month}`,
        {
          headers: getAuthHeaders()
        }
      );
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - getIncomesBySource error:', error);
      return { success: false, error: error.message };
    }
  },

  deleteIncome: async (id) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/income/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await handleResponse(response);
      return { success: true };
    } catch (error) {
      console.error('Financial API - deleteIncome error:', error);
      return { success: false, error: error.message };
    }
  },

  updateIncome: async (id, income) => {
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/v1/income/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(income)
      });
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - updateIncome error:', error);
      return { success: false, error: error.message };
    }
  },

  getMonthlySummary: async (userId, year, month) => {
    try {
      const response = await fetch(
        `${PUBLIC_BACKEND_URL}/api/v1/financial/summary?userId=${userId}&year=${year}&month=${month}`,
        {
          headers: getAuthHeaders()
        }
      );
      const data = await handleResponse(response);
      return { success: true, data };
    } catch (error) {
      console.error('Financial API - getMonthlySummary error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Export all APIs
export const api = {
  clients: clientsApi,
  cessions: cessionsApi,
  jobs: jobsApi,
  workplaces: workplacesApi,
  auth: authApi,
  documents: documentsApi,
  payments: paymentsApi,
  products: productsApi,
  categories: categoriesApi,
  stockMovements: stockMovementsApi,
  financial: financialApi
};
