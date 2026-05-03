import AsyncStorage from '@react-native-async-storage/async-storage';

//const BASE_URL = 'https://backend-circlo.onrender.com/api';
const BASE_URL = 'http://127.0.0.1:8080/api';
console.log('🚀 [CIRCLO] API Base URL:', BASE_URL);

const TIMEOUT_MS = 30000;

async function fetchWithTimeout(url: string, options: any) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error.name === 'AbortError' ? 'Request Timed Out' : error.message);
    throw error;
  }
}

const getUrl = (endpoint: string) => {
  if (endpoint.startsWith('/v2')) {
    return `${BASE_URL}${endpoint}`;
  }
  return `${BASE_URL}/v1${endpoint}`;
};

export const api = {
  async get(endpoint: string) {
    const token = await AsyncStorage.getItem('access_token');
    const response = await fetchWithTimeout(getUrl(endpoint), {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  async post(endpoint: string, data: any) {
    const token = await AsyncStorage.getItem('access_token');
    const response = await fetchWithTimeout(getUrl(endpoint), {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  },

  async delete(endpoint: string) {
    const token = await AsyncStorage.getItem('access_token');
    const response = await fetchWithTimeout(getUrl(endpoint), {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Delete failed');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return { success: response.ok };
  },

  async patch(endpoint: string, data: any) {
    const token = await AsyncStorage.getItem('access_token');
    const response = await fetchWithTimeout(getUrl(endpoint), {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Update failed');
    return result;
  },

  async uploadCircleMedia(circleId: string, fileUri: string, type: 'icon' | 'wallpaper') {
    const token = await AsyncStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: `${type}.jpg`,
    } as any);

    const response = await fetchWithTimeout(getUrl(`/circles/${circleId}/upload?type=${type}`), {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};
