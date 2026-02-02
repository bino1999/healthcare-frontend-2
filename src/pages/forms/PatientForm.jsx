// src/components/forms/PatientForm.jsx
import { useEffect, useState } from 'react';

function PatientForm({ initialData, onSubmit, onCancel, loading, submitLabel, cancelLabel, loadingLabel }) {
  const normalizeDateInput = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const [patientData, setPatientData] = useState({
    patient_name: initialData?.patient_name || '',
    mrn: initialData?.mrn || '',
    date_of_birth: normalizeDateInput(initialData?.date_of_birth),
    NRIC: initialData?.NRIC || '',
    gender: initialData?.gender || '',
    contact_number: initialData?.contact_number || '',
    email: initialData?.email || ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!initialData) return;
    setPatientData({
      patient_name: initialData.patient_name || '',
      mrn: initialData.mrn || '',
      date_of_birth: normalizeDateInput(initialData.date_of_birth),
      NRIC: initialData.NRIC || '',
      gender: initialData.gender || '',
      contact_number: initialData.contact_number || '',
      email: initialData.email || ''
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData({
      ...patientData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!patientData.patient_name.trim()) newErrors.patient_name = 'Patient name is required';
    if (!patientData.mrn.trim()) newErrors.mrn = 'MRN is required';
    if (!patientData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!patientData.NRIC.trim()) newErrors.NRIC = 'NRIC is required';
    if (!patientData.gender) newErrors.gender = 'Gender is required';
    if (!patientData.contact_number.trim()) newErrors.contact_number = 'Contact number is required';
    
    // Optional email validation
    if (patientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Clean data - convert empty strings to null
      const submissionData = {
        patient_name: patientData.patient_name || null,
        mrn: patientData.mrn || null,
        date_of_birth: patientData.date_of_birth || null,
        NRIC: patientData.NRIC || null,
        gender: patientData.gender || null,
        contact_number: patientData.contact_number || null,
        email: patientData.email || null
      };
      onSubmit(submissionData);
    }
  };

  const styles = {
    formSection: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '30px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '30px'
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
      cursor: 'pointer'
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
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.formSection}>
        <h2 style={styles.sectionTitle}>Patient Information</h2>
        
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Patient Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="patient_name"
              value={patientData.patient_name}
              onChange={handleChange}
              style={errors.patient_name ? styles.inputError : styles.input}
              placeholder="Enter patient name"
              disabled={loading}
            />
            {errors.patient_name && <span style={styles.errorMessage}>{errors.patient_name}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              MRN <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="mrn"
              value={patientData.mrn}
              onChange={handleChange}
              style={errors.mrn ? styles.inputError : styles.input}
              placeholder="Enter MRN"
              disabled={loading}
            />
            {errors.mrn && <span style={styles.errorMessage}>{errors.mrn}</span>}
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              NRIC <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="NRIC"
              value={patientData.NRIC}
              onChange={handleChange}
              style={errors.NRIC ? styles.inputError : styles.input}
              placeholder="Enter NRIC"
              disabled={loading}
            />
            {errors.NRIC && <span style={styles.errorMessage}>{errors.NRIC}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Date of Birth <span style={styles.required}>*</span>
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={patientData.date_of_birth}
              onChange={handleChange}
              style={errors.date_of_birth ? styles.inputError : styles.input}
              disabled={loading}
            />
            {errors.date_of_birth && <span style={styles.errorMessage}>{errors.date_of_birth}</span>}
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Gender <span style={styles.required}>*</span>
            </label>
            <select
              name="gender"
              value={patientData.gender}
              onChange={handleChange}
              style={errors.gender ? styles.inputError : styles.select}
              disabled={loading}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <span style={styles.errorMessage}>{errors.gender}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Contact Number <span style={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="contact_number"
              value={patientData.contact_number}
              onChange={handleChange}
              style={errors.contact_number ? styles.inputError : styles.input}
              placeholder="Enter contact number"
              disabled={loading}
            />
            {errors.contact_number && <span style={styles.errorMessage}>{errors.contact_number}</span>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={patientData.email}
            onChange={handleChange}
            style={errors.email ? styles.inputError : styles.input}
            placeholder="Enter email address"
            disabled={loading}
          />
          {errors.email && <span style={styles.errorMessage}>{errors.email}</span>}
        </div>
      </div>

      <div style={styles.formActions}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ ...styles.button, ...styles.buttonSecondary }}
            disabled={loading}
          >
            {cancelLabel || 'Cancel'}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            ...(loading ? styles.buttonDisabled : {})
          }}
        >
          {loading ? (loadingLabel || 'Creating Patient...') : (submitLabel || 'Next: Admission Details')}
        </button>
      </div>
    </form>
  );
}

export default PatientForm;