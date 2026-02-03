// src/pages/ReferralLetter/ReferralLetterForm.jsx
import { useState, useEffect } from 'react';
import directus from '../../api/directus';
import { readItems } from '@directus/sdk';

function ReferralLetterForm({ onSubmit, onCancel, loading, initialData = null, patientId = null }) {
  const [formData, setFormData] = useState({
    patient: initialData?.patient?.id || patientId || '',
    doctor: initialData?.doctor?.id || '',
    referral_date: initialData?.refferal_date || initialData?.referral_date || new Date().toISOString().split('T')[0],
    referral_reason: initialData?.referral_reason || ''
  });

  const [errors, setErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Fetch patients
      const patientsData = await directus.request(
        readItems('Patient', {
          fields: ['id', 'patient_name', 'mrn'],
          limit: -1,
          sort: ['patient_name']
        })
      );
      setPatients(patientsData);

      // Fetch doctors from doctor_profile
      const doctorsData = await directus.request(
        readItems('doctor_profile', {
          fields: ['id', 'specialization', 'user_id.*'],
          limit: -1,
          sort: ['-date_created']
        })
      );
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.patient) {
      newErrors.patient = 'Patient is required';
    }
    if (!formData.doctor) {
      newErrors.doctor = 'Doctor is required';
    }
    if (!formData.referral_date) {
      newErrors.referral_date = 'Referral date is required';
    }
    if (!formData.referral_reason.trim()) {
      newErrors.referral_reason = 'Referral reason is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        patient: formData.patient,
        doctor: formData.doctor,
        refferal_date: formData.referral_date,
        referral_reason: formData.referral_reason
      };
      onSubmit(submissionData);
    }
  };

  const styles = {
    formSection: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '30px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    sectionTitle: {
      color: '#34495e',
      fontSize: '1.3rem',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '2px solid #3498db'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '20px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#2c3e50'
    },
    required: {
      color: '#e74c3c'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #cbd5e0',
      borderRadius: '4px',
      fontSize: '0.95rem',
      boxSizing: 'border-box'
    },
    inputError: {
      width: '100%',
      padding: '10px',
      border: '1px solid #e74c3c',
      borderRadius: '4px',
      fontSize: '0.95rem',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #cbd5e0',
      borderRadius: '4px',
      fontSize: '0.95rem',
      boxSizing: 'border-box',
      cursor: 'pointer',
      backgroundColor: 'white'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #cbd5e0',
      borderRadius: '4px',
      fontSize: '0.95rem',
      boxSizing: 'border-box',
      minHeight: '150px',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    errorMessage: {
      color: '#e74c3c',
      fontSize: '0.85rem',
      marginTop: '5px',
      display: 'block'
    },
    formActions: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center',
      marginTop: '30px'
    },
    button: {
      padding: '12px 30px',
      fontSize: '1rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase'
    },
    buttonPrimary: {
      backgroundColor: '#3498db',
      color: 'white'
    },
    buttonSecondary: {
      backgroundColor: '#ecf0f1',
      color: '#2c3e50'
    },
    buttonDisabled: {
      backgroundColor: '#95a5a6',
      color: 'white',
      opacity: '0.6',
      cursor: 'not-allowed'
    },
    infoBox: {
      backgroundColor: '#ebf5fb',
      border: '1px solid #3498db',
      borderRadius: '4px',
      padding: '15px',
      marginBottom: '20px',
      color: '#2c3e50'
    },
    loadingText: {
      textAlign: 'center',
      padding: '20px',
      color: '#7f8c8d'
    }
  };

  if (loadingData) {
    return (
      <div style={styles.formSection}>
        <div style={styles.loadingText}>Loading form data...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.formSection}>
        <h2 style={styles.sectionTitle}>
          {initialData ? 'Edit Referral Letter' : 'Create Referral Letter'}
        </h2>
        
        {!patientId && (
          <div style={styles.infoBox}>
            <strong>Note:</strong> Create a referral letter for a patient to another doctor or specialist.
          </div>
        )}

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Patient <span style={styles.required}>*</span>
            </label>
            <select
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              style={errors.patient ? styles.inputError : styles.select}
              disabled={loading || !!patientId}
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.patient_name} (MRN: {patient.mrn})
                </option>
              ))}
            </select>
            {errors.patient && <span style={styles.errorMessage}>{errors.patient}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Referring Doctor <span style={styles.required}>*</span>
            </label>
            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              style={errors.doctor ? styles.inputError : styles.select}
              disabled={loading}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => {
                const user = doctor.user_id;
                const doctorName = user
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                  : '';
                return (
                  <option key={doctor.id} value={doctor.id}>
                    {doctorName || 'Unnamed Doctor'}
                    {doctor.specialization && ` - ${doctor.specialization}`}
                  </option>
                );
              })}
            </select>
            {errors.doctor && <span style={styles.errorMessage}>{errors.doctor}</span>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Referral Date <span style={styles.required}>*</span>
          </label>
          <input
            type="date"
            name="referral_date"
            value={formData.referral_date}
            onChange={handleChange}
            style={errors.referral_date ? styles.inputError : styles.input}
            disabled={loading}
          />
          {errors.referral_date && <span style={styles.errorMessage}>{errors.referral_date}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Referral Reason <span style={styles.required}>*</span>
          </label>
          <textarea
            name="referral_reason"
            value={formData.referral_reason}
            onChange={handleChange}
            style={errors.referral_reason ? styles.inputError : styles.textarea}
            placeholder="Enter the reason for referral, including patient's condition, diagnosis, and required specialist consultation..."
            disabled={loading}
          />
          {errors.referral_reason && <span style={styles.errorMessage}>{errors.referral_reason}</span>}
        </div>
      </div>

      <div style={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          style={{ ...styles.button, ...styles.buttonSecondary }}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            ...(loading ? styles.buttonDisabled : {})
          }}
        >
          {loading ? 'Saving...' : initialData ? 'Update Referral Letter' : 'Create Referral Letter'}
        </button>
      </div>
    </form>
  );
}

export default ReferralLetterForm;