const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url;
  }
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://drishti-ai-backend.onrender.com';
    }
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function getModelInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/model-info`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
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

  try {
    const res = await fetch(`${API_BASE_URL}/api/detect`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API connection failed:', err);
    return null;
  }
}
