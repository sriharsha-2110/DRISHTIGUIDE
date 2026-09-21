const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }
  return 'https://drishti-ai-backend-vwl4.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

export async function checkHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    let res = await fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal });
    if (!res.ok) {
      res = await fetch(`${API_BASE_URL}/`, { signal: controller.signal });
    }
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { status: 'online', data };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[API Connection Error] Failed connecting to backend at ${API_BASE_URL}:`, err);
    return { status: 'offline', error: err.message, url: API_BASE_URL };
  }
}

export async function getModelInfo() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/model-info`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[Model Info Error] ${API_BASE_URL}:`, err);
    return { status: 'error', error: err.message };
  }
}

export async function getMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/metrics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { evaluation_available: false, error: err.message };
  }
}

export async function getDatasetInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dataset`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { configured: false, message: 'Dataset not configured.', total_images: 0, samples: [] };
  }
}

export async function analyzeImageBlob(imageBlob, force = false) {
  const formData = new FormData();
  formData.append('file', imageBlob, 'frame.jpg');

  // Enforce 30-second timeout to handle Render free tier cold starts & mobile networks smoothly
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/detect`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[Detection API Error] Target ${API_BASE_URL}/api/detect failed or timed out:`, err);
    return null;
  }
}
