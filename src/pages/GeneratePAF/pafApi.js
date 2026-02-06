// src/pages/GeneratePAF/pafApi.js

const PAF_API_URL = 'http://100.64.177.106:5678/webhook-test/fronthead';

/**
 * Get the access token from localStorage
 * @returns {string|null} Access token
 */
function getAccessToken() {
  return localStorage.getItem('directus_token');
}

/**
 * Build PAF payload from patient data
 * @param {Object} patient - Patient object with all related data
 * @param {Object} admission - Admission record
 * @param {Object} insurance - Insurance record
 * @returns {Object} PAF payload
 */
export function buildPafPayload(patient, admission, insurance) {
  // Get doctor name from admission's user_created (the doctor who created the admission)
  const doctorFirstName = admission?.user_created?.first_name || '';
  const doctorLastName = admission?.user_created?.last_name || '';
  const doctorFullName = `${doctorFirstName} ${doctorLastName}`.trim() || 'N/A';

  return {
    patient: patient?.id || null,
    patient_name: patient?.patient_name || '',
    mrn: patient?.mrn || '',
    date_of_birth: patient?.date_of_birth || '',
    email: patient?.email || '',
    contact_number: patient?.contact_number || '',
    gender: patient?.gender || '',
    NRIC: patient?.NRIC || '',
    admission: admission?.id || null,
    insurance: insurance?.id || null,
    tpa_name: insurance?.tpa_name || '',
    doctor_full_name: doctorFullName
  };
}

/**
 * Generate PAF by sending data to the API
 * @param {Object} patient - Patient object
 * @param {Object} admission - Admission record
 * @param {Object} insurance - Insurance record
 * @returns {Promise<Object>} API response
 */
export async function generatePAF(patient, admission, insurance) {
  const payload = buildPafPayload(patient, admission, insurance);
  const accessToken = getAccessToken();

  console.log('Generating PAF with payload:', payload);

  const headers = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(PAF_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate PAF: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Validate that required data is present for PAF generation
 * @param {Object} patient - Patient object
 * @param {Object} admission - Admission record
 * @param {Object} insurance - Insurance record
 * @returns {Object} { isValid: boolean, missingFields: string[] }
 */
export function validatePafData(patient, admission, insurance) {
  const missingFields = [];

  if (!patient?.id) missingFields.push('Patient ID');
  if (!patient?.patient_name) missingFields.push('Patient Name');
  if (!patient?.mrn) missingFields.push('MRN');
  if (!admission?.id) missingFields.push('Admission Record');
  if (!insurance?.id) missingFields.push('Insurance Record');

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}
