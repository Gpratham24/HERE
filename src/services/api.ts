import { supabase } from '../utils/supabase';

const BACKEND_URL = 'http://localhost:8080';

// ─── Internal helpers ─────────────────────────────────────────────────────────
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}${path}`, { method: 'GET', headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function apiPost<T>(path: string, body: object = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Circle APIs (Writes → Go Backend) ───────────────────────────────────────
export const uploadImage = async (file: { uri: string; type: string; name: string }) => {
  const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  // In React Native, we MUST use FormData for Supabase Storage uploads
  // to avoid 'Invalid Content-Type header' errors.
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || fileName,
    type: file.type || 'image/jpeg',
  } as any);

  const { data, error } = await supabase.storage
    .from('IMAGE')
    .upload(filePath, formData);

  if (error) {
    console.error('Supabase Upload Error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('IMAGE')
    .getPublicUrl(data.path);

  return publicUrl;
};

export const createCircle = (name: string, description: string, avatarUrl: string = '') =>
  apiPost<{ id: string; name: string }>('/api/v1/circles', { name, description, avatar_url: avatarUrl });

export const joinCircle = (circleId: string) =>
  apiPost<{ message: string }>(`/api/v1/circles/${circleId}/join`, {});

// ─── Check-in APIs (Writes → Go Backend) ─────────────────────────────────────
export const submitCheckin = (circleId: string, type: string, note: string) =>
  apiPost<{ id: string }>('/api/v1/posts', { circle_id: circleId, type, note });

// ─── Health ───────────────────────────────────────────────────────────────────
export const checkBackendHealth = () =>
  apiGet<{ status: string; system: string }>('/health');
