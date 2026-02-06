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
      msRefreshBeforeExpires: 300000, // Refresh 5 minutes before expiry
      storage: authStorage
    })
  )
  .with(rest());

// Restore persisted auth token on app startup (fallback for older SDK behavior)
const savedToken = localStorage.getItem('directus_token');
if (savedToken) {
  directus.setToken(savedToken);
}

// Periodic token refresh to prevent automatic logout
let refreshInterval = null;

export function startTokenRefreshTimer() {
  if (refreshInterval) return;
  
  // Refresh token every 10 minutes
  refreshInterval = setInterval(async () => {
    const refreshToken = localStorage.getItem('directus_refresh_token');
    if (!refreshToken) return;
    
    try {
      const result = await directus.refresh();
      if (result?.access_token) {
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.warn('Token refresh failed:', error.message);
    }
  }, 10 * 60 * 1000); // 10 minutes
  
  console.log('Token refresh timer started');
}

export function stopTokenRefreshTimer() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('Token refresh timer stopped');
  }
}

export default directus;
