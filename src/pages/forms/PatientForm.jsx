// src/components/forms/PatientForm.jsx
import { useEffect, useRef, useState } from 'react';

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

  // Speech recognition helpers
  const recognitionRef = useRef(null);
  const [listeningField, setListeningField] = useState(null);
  const recognitionSupported = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

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

  // --- Speech recognition (voice typing) ---
  const toggleListening = (field) => {
    if (!recognitionSupported) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    // If already listening this field, stop
    if (listeningField === field) {
      try { recognitionRef.current?.stop(); } catch (e) { /* ignore */ }
      setListeningField(null);
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = (event.results && event.results[0] && event.results[0][0] && event.results[0][0].transcript) || '';
      let value = transcript.trim();

      // Basic normalization for special fields
      if (field === 'contact_number') {
        // keep digits only
        value = value.replace(/\D+/g, '');
      } else if (field === 'email') {
        // try to convert spoken 'at' / 'dot' into email punctuation
        value = value.toLowerCase()
          .replace(/\s+at\s+/g, '@')
          .replace(/\s+dot\s+/g, '.')
          .replace(/\s+/g, '');
      }

      setPatientData((prev) => ({ ...prev, [field]: value }));
      setListeningField(null);
      try { recognition.stop(); } catch (e) { /* ignore */ }
    };

    recognition.onerror = (err) => {
      console.error('Speech recognition error', err);
      setListeningField(null);
    };

    recognition.onend = () => {
      setListeningField(null);
    };

    recognitionRef.current = recognition;
    setListeningField(field);
    recognition.start();
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

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
    micButton: {
      background: '#fff',
      border: '1px solid #cbd5e0',
      borderRadius: '50%',
      width: 34,
      height: 34,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      padding: 0
    },
    micActive: {
      background: '#e6f7ff',
      borderColor: '#60a5fa'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="text"
                name="patient_name"
                value={patientData.patient_name}
                onChange={handleChange}
                style={errors.patient_name ? styles.inputError : styles.input}
                placeholder="Enter patient name"
                disabled={loading}
              />
              <button
                type="button"
                aria-label="Voice input for patient name"
                onClick={() => toggleListening('patient_name')}
                style={{
                  ...styles.micButton,
                  ...(listeningField === 'patient_name' ? styles.micActive : {})
                }}
                disabled={loading || !recognitionSupported}
              >
                <span role="img" aria-label="mic">🎤</span>
              </button>
            </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="tel"
                name="contact_number"
                value={patientData.contact_number}
                onChange={handleChange}
                style={errors.contact_number ? styles.inputError : styles.input}
                placeholder="Enter contact number"
                disabled={loading}
              />
              <button
                type="button"
                aria-label="Voice input for contact number"
                onClick={() => toggleListening('contact_number')}
                style={{
                  ...styles.micButton,
                  ...(listeningField === 'contact_number' ? styles.micActive : {})
                }}
                disabled={loading || !recognitionSupported}
              >
                <span role="img" aria-label="mic">🎤</span>
              </button>
            </div>
            {errors.contact_number && <span style={styles.errorMessage}>{errors.contact_number}</span>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="email"
              name="email"
              value={patientData.email}
              onChange={handleChange}
              style={errors.email ? styles.inputError : styles.input}
              placeholder="Enter email address"
              disabled={loading}
            />
            <button
              type="button"
              aria-label="Voice input for email"
              onClick={() => toggleListening('email')}
              style={{
                ...styles.micButton,
                ...(listeningField === 'email' ? styles.micActive : {})
              }}
              disabled={loading || !recognitionSupported}
            >
              <span role="img" aria-label="mic">🎤</span>
            </button>
          </div>
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