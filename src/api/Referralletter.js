// src/api/referralLetter.js
import directus from './directus';
import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { getUser } from '../utils/auth';

const canManageReferralLetter = () => {
  const roleName = getUser()?.role?.name;
  // Doctors and Administrators can manage referral letters
  return roleName === 'Administrator' || roleName === 'Doctor';
};

const canViewReferralLetter = () => {
  const roleName = getUser()?.role?.name;
  // Doctors, Nurses, and Administrators can view referral letters
  return roleName === 'Administrator' || roleName === 'Doctor' || roleName === 'Hospital_staff';
};

// Get all referral letters
export async function getReferralLetters(filters = {}) {
  if (!canViewReferralLetter()) {
    throw new Error('You do not have permission to view referral letters');
  }

  try {
    const referralLetters = await directus.request(
      readItems('Referral_Letter', {
        fields: [
          '*',
          'doctor.*',
          'doctor.user_id.*',
          'user_created.id',
          'user_created.first_name',
          'user_created.last_name',
          'patient.id',
          'patient.patient_name',
          'patient.mrn',
          'patient.date_of_birth',
          'patient.gender'
        ],
        filter: filters,
        limit: -1,
        sort: ['-date_created']
      })
    );

    return referralLetters;
  } catch (error) {
    console.error('Get referral letters error:', error);
    throw new Error('Failed to fetch referral letters');
  }
}

// Get single referral letter
export async function getReferralLetter(id) {
  if (!canViewReferralLetter()) {
    throw new Error('You do not have permission to view referral letters');
  }

  try {
    const referralLetter = await directus.request(
      readItem('Referral_Letter', id, {
        fields: [
          '*',
          'doctor.*',
          'doctor.user_id.*',
          'user_created.id',
          'user_created.first_name',
          'user_created.last_name',
          'patient.id',
          'patient.patient_name',
          'patient.mrn',
          'patient.date_of_birth',
          'patient.gender',
          'patient.contact_number'
        ]
      })
    );

    return referralLetter;
  } catch (error) {
    console.error('Get referral letter error:', error);
    throw new Error('Failed to fetch referral letter');
  }
}

// Get referral letters by patient
export async function getReferralLettersByPatient(patientId) {
  if (!canViewReferralLetter()) {
    throw new Error('You do not have permission to view referral letters');
  }

  try {
    const referralLetters = await directus.request(
      readItems('Referral_Letter', {
        fields: [
          '*',
          'doctor.*',
          'doctor.user_id.*',
          'user_created.id',
          'user_created.first_name',
          'user_created.last_name',
          'patient.id',
          'patient.patient_name',
          'patient.mrn'
        ],
        filter: {
          patient: {
            _eq: patientId
          }
        },
        sort: ['-date_created']
      })
    );

    return referralLetters;
  } catch (error) {
    console.error('Get referral letters by patient error:', error);
    throw new Error('Failed to fetch referral letters for patient');
  }
}

// Get referral letters by doctor
export async function getReferralLettersByDoctor(doctorId) {
  if (!canViewReferralLetter()) {
    throw new Error('You do not have permission to view referral letters');
  }

  try {
    const referralLetters = await directus.request(
      readItems('Referral_Letter', {
        fields: [
          '*',
          'doctor.*',
          'doctor.user_id.*',
          'user_created.id',
          'user_created.first_name',
          'user_created.last_name',
          'patient.id',
          'patient.patient_name',
          'patient.mrn'
        ],
        filter: {
          doctor: {
            _eq: doctorId
          }
        },
        sort: ['-date_created']
      })
    );

    return referralLetters;
  } catch (error) {
    console.error('Get referral letters by doctor error:', error);
    throw new Error('Failed to fetch referral letters for doctor');
  }
}

// Create referral letter (Doctor/Admin only)
export async function createReferralLetter(referralLetterData) {
  if (!canManageReferralLetter()) {
    throw new Error('You do not have permission to create referral letters');
  }

  try {
    const currentUser = getUser();
    const payload = {
      ...referralLetterData,
      ...(currentUser?.id && !referralLetterData?.user_created
        ? { user_created: currentUser.id }
        : {})
    };
    const referralLetter = await directus.request(
      createItem('Referral_Letter', payload)
    );

    return referralLetter;
  } catch (error) {
    console.error('Create referral letter error:', error);

    if (error.response?.status === 403) {
      throw new Error('You do not have permission to create referral letters');
    }

    throw new Error(error.errors?.[0]?.message || 'Failed to create referral letter');
  }
}

// Update referral letter (Doctor/Admin only)
export async function updateReferralLetter(id, referralLetterData) {
  if (!canManageReferralLetter()) {
    throw new Error('You do not have permission to update referral letters');
  }

  try {
    const referralLetter = await directus.request(
      updateItem('Referral_Letter', id, referralLetterData)
    );

    return referralLetter;
  } catch (error) {
    console.error('Update referral letter error:', error);

    if (error.response?.status === 403) {
      throw new Error('You do not have permission to update referral letters');
    }

    throw new Error('Failed to update referral letter');
  }
}

// Delete referral letter (Doctor/Admin only)
export async function deleteReferralLetter(id) {
  if (!canManageReferralLetter()) {
    throw new Error('You do not have permission to delete referral letters');
  }

  try {
    await directus.request(deleteItem('Referral_Letter', id));
    return true;
  } catch (error) {
    console.error('Delete referral letter error:', error);

    if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete referral letters');
    }

    throw new Error('Failed to delete referral letter');
  }
}