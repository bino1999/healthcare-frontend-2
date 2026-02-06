// src/api/auth.js
import directus, { startTokenRefreshTimer, stopTokenRefreshTimer } from './directus';
import { readMe } from '@directus/sdk';

const USER_FIELDS = ['id', 'email', 'first_name', 'last_name', 'role.id', 'role.name', 'avatar'];

// Initialize authentication on page load
export async function initAuth() {
  const refreshToken = localStorage.getItem('directus_refresh_token');

  try {
    // Try to get current user (this will use stored token)
    const user = await directus.request(readMe({ fields: USER_FIELDS }));

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      startTokenRefreshTimer();
      return user;
    }
  } catch (error) {
    // Try refresh token before clearing storage
    if (refreshToken) {
      try {
        const refreshed = await directus.refresh({ refresh_token: refreshToken });
        const newAccess = refreshed?.access_token;
        const newRefresh = refreshed?.refresh_token;

        if (newAccess) {
          directus.setToken(newAccess);
          localStorage.setItem('directus_token', newAccess);
        }
        if (newRefresh) {
          localStorage.setItem('directus_refresh_token', newRefresh);
        }

        const user = await directus.request(readMe({ fields: USER_FIELDS }));
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          startTokenRefreshTimer();
          return user;
        }
      } catch (refreshError) {
        // fall through to clear storage
      }
    }

    localStorage.removeItem('user');
    localStorage.removeItem('directus_token');
    localStorage.removeItem('directus_refresh_token');
    return null;
  }
}

// Login user
export async function login(email, password) {
  try {
    const loginResp = await directus.login(email, password);

    // Save tokens for persistence across page reloads
    const accessToken = loginResp?.access_token || directus?.auth?.token;
    const refreshToken = loginResp?.refresh_token;
    if (accessToken) {
      localStorage.setItem('directus_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('directus_refresh_token', refreshToken);
    }

    const user = await directus.request(readMe({ fields: USER_FIELDS }));

    // Cache user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    startTokenRefreshTimer();

    return { success: true, user };
  } catch (error) {
    throw new Error(error.errors?.[0]?.message || 'Login failed');
  }
}

// Logout user
export async function logout() {
  stopTokenRefreshTimer();
  try {
    await directus.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('user');
    localStorage.removeItem('directus_token');
    localStorage.removeItem('directus_refresh_token');
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const user = await directus.request(readMe({ fields: USER_FIELDS }));

    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Check if authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('user');
}

// Get cached user
export function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}