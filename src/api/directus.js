// src/api/directus.js
import { createDirectus, rest, authentication } from '@directus/sdk';

const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL || 'http://100.64.177.106:8055')
  .with(authentication('json'))
  .with(rest());

// Restore persisted auth token on app startup
const savedToken = localStorage.getItem('directus_token');
if (savedToken) {
  // Set the static token for authentication
  directus.setToken(savedToken);
}

export default directus;
