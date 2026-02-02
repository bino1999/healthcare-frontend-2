// src/utils/auth.js

// Get current user from localStorage
export function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('user');
}

// Check if user is an administrator
export function isAdmin() {
  const user = getUser();
  return user?.role?.name === 'Administrator';
}

// Check if user is a doctor
export function isDoctor() {
  const user = getUser();
  return user?.role?.name === 'Doctor';
}

// Check if user is  Hospital Staff
export function isStaff() {
  const user = getUser();
  return user?.role?.name === 'Hospital Staff' || user?.role?.name === 'Hospital_staff';
}

// Get user role name
export function getUserRole() {
  const user = getUser();
  return user?.role?.name || null;
}