// src/api/auth.js
import directus from './directus';
import { readMe } from '@directus/sdk';

// Initialize authentication on page load
export async function initAuth() {
  try {
    // Try to get current user (this will use stored token)
    const user = await directus.request(
      readMe({
        fields: ['id', 'email', 'first_name', 'last_name', 'role.id', 'role.name', 'avatar']
      })
    );
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
  } catch (error) {
    // Token expired or invalid, clear storage
    localStorage.removeItem('user');
    return null;
  }
}

// Login user
export async function login(email, password) {
  try {
    const loginResp = await directus.login(email, password);
    
    // Save the access token for persistence across page reloads
    const token = loginResp?.access_token || directus?.auth?.token;
    if (token) {
      localStorage.setItem('directus_token', token);
    }
    
    const user = await directus.request(
      readMe({
        fields: ['id', 'email', 'first_name', 'last_name', 'role.id', 'role.name', 'avatar']
      })
    );
    
    // Cache user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    throw new Error(error.errors?.[0]?.message || 'Login failed');
  }
}

// Logout user
export async function logout() {
  try {
    await directus.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('user');
    localStorage.removeItem('directus_token');
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const user = await directus.request(
      readMe({
        fields: ['id', 'email', 'first_name', 'last_name', 'role.id', 'role.name', 'avatar']
      })
    );
    
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