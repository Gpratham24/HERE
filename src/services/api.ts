import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';

const BACKEND_URL = 'https://here-backend-t6qt.onrender.com';

// ─── Token Memory Cache ───────────────────────────────────────────────────────
let activeToken: string | null = null;
export const setSessionToken = (token: string | null) => {
  activeToken = token;
};

// ─── API Cache Configuration ──────────────────────────────────────────────────
const CACHE_PREFIX = '@api_cache_';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch (err) {
    return null;
  }
}

async function setCachedData(key: string, data: any) {
  try {
    const cacheValue = JSON.stringify({ data, timestamp: Date.now() });
    await AsyncStorage.setItem(CACHE_PREFIX + key, cacheValue);
  } catch (err) {
    console.error('Cache set error:', err);
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  // 1. Try Memory First
  let token = activeToken;

  // 2. Try Supabase Session if memory is empty
  if (!token) {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (!error && session) {
      token = session.access_token;
      activeToken = token;
    }
  }

  // 3. Fallback to getUser/refresh if needed
  if (!token) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: { session } } = await supabase.auth.refreshSession();
      token = session?.access_token ?? null;
      if (token) activeToken = token;
    }
  }

  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true,
  skipCache: boolean = false,
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  const method = options.method || 'GET';

  // Only GET requests should be cached
  const cacheKey = endpoint;
  if (method === 'GET' && !skipCache) {
    const cached = await getCachedData<T>(cacheKey);
    if (cached) {
      console.log(`[CACHE] 📦 ${url}`);
      return cached;
    }
  }

  let headers: Record<string, string> = { ...(options.headers as any) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (requireAuth) {
    const authHeaders = await getAuthHeaders();
    headers = { ...headers, ...authHeaders };
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(id);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: text };
    }

    if (!response.ok) {
      throw new Error(data.error || data.msg || data.message || 'Something went wrong');
    }

    if (method === 'GET') {
      await setCachedData(cacheKey, data);
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(id);
    throw error;
  }
}

async function apiGet<T>(path: string, skipCache: boolean = false): Promise<T> {
  return request<T>(path, { method: 'GET' }, true, skipCache);
}

export const apiPost = <T>(
  endpoint: string,
  body: any,
  isFormData: boolean = false,
): Promise<T> => {
  return request<T>(endpoint, {
    method: 'POST',
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    body: isFormData ? body : JSON.stringify(body),
  });
};

export const signup = (email: string, password: string, username: string) =>
  request<any>(
    '/api/v1/auth/signup',
    {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    },
    false,
  );

export const login = (email: string, password: string) =>
  request<any>(
    '/api/v1/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false,
  );

export const uploadImage = async (file: { uri: string; type: string; name: string }) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || `image_${Date.now()}.jpg`,
    type: file.type || 'image/jpeg',
  } as any);

  return apiPost<{ url: string }>('/api/v1/upload', formData, true).then(res => res.url);
};

export const uploadUserAvatar = async (file: { uri: string; type: string; name: string }) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || `avatar_${Date.now()}.jpg`,
    type: file.type || 'image/jpeg',
  } as any);

  return apiPost<{ url: string }>('/api/v1/user/avatar/upload', formData, true).then(res => res.url);
};

export const createCircle = (params: any) => apiPost<any>('/api/v1/circles', params);
export const getCircles = () => apiGet<any[]>('/api/v1/circles');
export const getCircleByCode = async (inviteCode: string) => {
  const { data, error } = await supabase
    .from('circles')
    .select('id, name')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();
  if (error) throw error;
  return data;
};
export const joinCircle = (circleId: string) => apiPost<any>(`/api/v1/circles/${circleId}/join`, {});
export const getUserCircles = () => apiGet<any[]>('/api/v1/circles');
export const logCheckIn = (circleId: string, type: string, note: string = '') =>
  apiPost<any>('/api/v1/checkins', { circle_id: circleId, type, note });

export const getHomeData = (circleId?: string) => {
  const url = circleId ? `/api/v1/home-data?circle_id=${circleId}` : '/api/v1/home-data';
  return apiGet<any>(url);
};

export const updatePresence = (status: string) => apiPost<any>('/api/v1/presence', { status });
export const addReaction = (postId: string, emoji: string) => apiPost<any>(`/api/v1/posts/${postId}/react`, { emoji });
export const createPost = (params: any) => apiPost<any>('/api/v1/posts', params);
export const getUserProfile = () => apiGet<any>('/api/v1/user/profile');
export const deleteAccount = () => request<any>('/api/v1/user/account', { method: 'DELETE' });
export const checkBackendHealth = () => apiGet<any>('/health');
