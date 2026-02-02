// src/api/hospitalWard.js
import directus from './directus';
import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { getUser } from '../utils/auth';

const canManageWard = () => {
  const roleName = getUser()?.role?.name;
  return roleName === 'Administrator' || roleName === 'Hospital_staff' || roleName === 'Hospital Staff';
};

// Get all hospital wards
export async function getHospitalWards(filters = {}) {
  try {
    const wards = await directus.request(
      readItems('hospital_ward', {
        fields: ['*'],
        filter: filters,
        limit: -1,
        sort: ['-date_created']
      })
    );

    return wards;
  } catch (error) {
    console.error('Get hospital wards error:', error);
    throw new Error('Failed to fetch hospital wards');
  }
}

// Get single hospital ward
export async function getHospitalWard(id) {
  try {
    const ward = await directus.request(
      readItem('hospital_ward', id, {
        fields: ['*']
      })
    );

    return ward;
  } catch (error) {
    console.error('Get hospital ward error:', error);
    throw new Error('Failed to fetch hospital ward');
  }
}

// Create hospital ward (Admin/Staff only)
export async function createHospitalWard(wardData) {
  if (!canManageWard()) {
    throw new Error('You do not have permission to create hospital wards');
  }

  try {
    const ward = await directus.request(
      createItem('hospital_ward', wardData)
    );

    return ward;
  } catch (error) {
    console.error('Create hospital ward error:', error);

    if (error.response?.status === 403) {
      throw new Error('You do not have permission to create hospital wards');
    }

    throw new Error(error.errors?.[0]?.message || 'Failed to create hospital ward');
  }
}

// Update hospital ward (Admin/Staff only)
export async function updateHospitalWard(id, wardData) {
  if (!canManageWard()) {
    throw new Error('You do not have permission to update hospital wards');
  }

  try {
    const ward = await directus.request(
      updateItem('hospital_ward', id, wardData)
    );

    return ward;
  } catch (error) {
    console.error('Update hospital ward error:', error);

    if (error.response?.status === 403) {
      throw new Error('You do not have permission to update hospital wards');
    }

    throw new Error('Failed to update hospital ward');
  }
}

// Delete hospital ward (Admin/Staff only)
export async function deleteHospitalWard(id) {
  if (!canManageWard()) {
    throw new Error('You do not have permission to delete hospital wards');
  }

  try {
    await directus.request(deleteItem('hospital_ward', id));
    return true;
  } catch (error) {
    console.error('Delete hospital ward error:', error);

    if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete hospital wards');
    }

    throw new Error('Failed to delete hospital ward');
  }
}
