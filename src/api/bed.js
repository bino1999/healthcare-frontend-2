// src/api/bed.js
import directus from './directus';
import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { getUser } from '../utils/auth';

const canManageBed = () => {
  const roleName = getUser()?.role?.name;
  return roleName === 'Administrator' || roleName === 'Hospital_staff' || roleName === 'Hospital Staff';
};

// Get all beds
export async function getBeds(filters = {}) {
  try {
    const beds = await directus.request(
      readItems('Bed', {
        fields: ['*', 'select_ward.*', 'Patient.*'],
        filter: filters,
        limit: -1,
        sort: ['-date_created']
      })
    );

    return beds;
  } catch (error) {
    console.error('Get beds error:', error);
    throw new Error('Failed to fetch beds');
  }
}

// Get single bed
export async function getBed(id) {
  try {
    const bed = await directus.request(
      readItem('Bed', id, {
        fields: ['*', 'select_ward.*', 'Patient.*']
      })
    );

    return bed;
  } catch (error) {
    console.error('Get bed error:', error);
    throw new Error('Failed to fetch bed');
  }
}

// Create bed (Admin/Staff only)
export async function createBed(bedData) {
  if (!canManageBed()) {
    throw new Error('You do not have permission to create beds');
  }

  try {
    const bed = await directus.request(
      createItem('Bed', bedData)
    );

    return bed;
  } catch (error) {
    console.error('Create bed error:', error);

    if (error.response?.status === 403) {
      throw new Error('You do not have permission to create beds');
    }

    throw new Error(error.errors?.[0]?.message || 'Failed to create bed');
  }
}

// Update bed (Admin/Staff only)
export async function updateBed(id, bedData) {
  if (!canManageBed()) {
    throw new Error('You do not have permission to update beds');
  }

  try {
    const bed = await directus.request(
      updateItem('Bed', id, bedData)
    );

    return bed;
  } catch (error) {
    console.error('Update bed error:', error);

    if (error.response?.status === 403) {
      throw new Error('You do not have permission to update beds');
    }

    throw new Error('Failed to update bed');
  }
}

// Delete bed (Admin/Staff only)
export async function deleteBed(id) {
  if (!canManageBed()) {
    throw new Error('You do not have permission to delete beds');
  }

  try {
    await directus.request(deleteItem('Bed', id));
    return true;
  } catch (error) {
    console.error('Delete bed error:', error);

    if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete beds');
    }

    throw new Error('Failed to delete bed');
  }
}

// Check and update bed status to vacant if no patient assigned
export async function syncBedStatus(bedId) {
  try {
    const bed = await directus.request(
      readItem('Bed', bedId, { fields: ['*', 'Patient'] })
    );

    // If bed has no patient but status is not vacant, update to vacant
    if (!bed.Patient && bed.Status !== 'vacant') {
      await directus.request(
        updateItem('Bed', bedId, { Status: 'vacant' })
      );
      console.log(`Bed ${bedId} status synced to vacant (no patient assigned)`);
      return { ...bed, Status: 'vacant' };
    }

    return bed;
  } catch (error) {
    console.error('Sync bed status error:', error);
    throw new Error('Failed to sync bed status');
  }
}

// Check and update all beds - set vacant if no patient assigned
export async function syncAllBedStatuses() {
  try {
    const beds = await directus.request(
      readItems('Bed', {
        fields: ['id', 'Status', 'Patient'],
        limit: -1
      })
    );

    const updatePromises = beds
      .filter(bed => !bed.Patient && bed.Status !== 'vacant')
      .map(bed => 
        directus.request(
          updateItem('Bed', bed.id, { Status: 'vacant' })
        )
      );

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`${updatePromises.length} bed(s) status synced to vacant`);
    }

    return { updated: updatePromises.length };
  } catch (error) {
    console.error('Sync all bed statuses error:', error);
    throw new Error('Failed to sync bed statuses');
  }
}
