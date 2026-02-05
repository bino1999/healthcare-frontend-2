// src/api/directus.js
import { createDirectus, rest, authentication } from '@directus/sdk';

const authStorage = {
  get: () => {
    const access_token = localStorage.getItem('directus_token');
    const refresh_token = localStorage.getItem('directus_refresh_token');
    if (!access_token && !refresh_token) return null;
    return { access_token, refresh_token };
  },
  set: (value) => {
    if (!value) return;
    if (value.access_token) {
      localStorage.setItem('directus_token', value.access_token);
    }
    if (value.refresh_token) {
      localStorage.setItem('directus_refresh_token', value.refresh_token);
    }
  },
  delete: () => {
    localStorage.removeItem('directus_token');
    localStorage.removeItem('directus_refresh_token');
  }
};

const directus = createDirectus(
  import.meta.env.VITE_DIRECTUS_URL || 'http://100.64.177.106:8055'
)
  .with(
    authentication('json', {
      autoRefresh: true,
      storage: authStorage
    })
  )
  .with(rest());

// Restore persisted auth token on app startup (fallback for older SDK behavior)
const savedToken = localStorage.getItem('directus_token');
if (savedToken) {
  directus.setToken(savedToken);
}

export default directus;
