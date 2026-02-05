import { useEffect, useState } from 'react';

function BedForm({ wards = [], onSubmit, onCancel, loading, initialData = null }) {
  const [bedData, setBedData] = useState({
    bed_no: initialData?.bed_no || '',
    Status: initialData?.Status || '',
    Category: initialData?.Category || '',
    select_ward: initialData?.select_ward?.id || initialData?.select_ward || ''
  });

  const [errors, setErrors] = useState({});

  const bedStatusOptions = [
    'Vacant',
    'Occupied',
    'Discharged',
    'Booking',
    'Transfer',
    'Blocked',
    'Lodger',
    'Cleaning',
    'Discharge',
    'Pre-Discharge'
  ];

  const bedCategoryOptions = [
    'Executive Suite',
    'VIP',
    'Single Deluxe',
    'Single Standard',
    '2 Bedded',
    '4 Bedded',
    'Isolation Room'
  ];

  useEffect(() => {
    setBedData({
      bed_no: initialData?.bed_no || '',
      Status: initialData?.Status || '',
      Category: initialData?.Category || '',
      select_ward: initialData?.select_ward?.id || initialData?.select_ward || ''
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBedData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!bedData.bed_no.trim()) newErrors.bed_no = 'Bed number is required';
    if (!bedData.Status) newErrors.Status = 'Bed status is required';
    if (!bedData.Category) newErrors.Category = 'Bed category is required';
    if (!bedData.select_ward) newErrors.select_ward = 'Ward selection is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      bed_no: bedData.bed_no,
      Status: bedData.Status,
      Category: bedData.Category,
      select_ward: bedData.select_ward
    };

    onSubmit(payload);
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
      cursor: 'pointer',
      backgroundColor: 'white'
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
        <h2 style={styles.sectionTitle}>Bed Information</h2>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Bed Number <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="bed_no"
              value={bedData.bed_no}
              onChange={handleChange}
              style={errors.bed_no ? styles.inputError : styles.input}
              placeholder="e.g., B-101"
              disabled={loading}
            />
            {errors.bed_no && <span style={styles.errorMessage}>{errors.bed_no}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Ward <span style={styles.required}>*</span>
            </label>
            <select
              name="select_ward"
              value={bedData.select_ward}
              onChange={handleChange}
              style={errors.select_ward ? styles.inputError : styles.select}
              disabled={loading}
            >
              <option value="">Select Ward</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.ward_name} ({ward.ward_code})
                </option>
              ))}
            </select>
            {errors.select_ward && (
              <span style={styles.errorMessage}>{errors.select_ward}</span>
            )}
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Bed Status <span style={styles.required}>*</span>
            </label>
            <select
              name="Status"
              value={bedData.Status}
              onChange={handleChange}
              style={errors.Status ? styles.inputError : styles.select}
              disabled={loading}
            >
              <option value="">Select Status</option>
              {bedStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.Status && <span style={styles.errorMessage}>{errors.Status}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Bed Category <span style={styles.required}>*</span>
            </label>
            <select
              name="Category"
              value={bedData.Category}
              onChange={handleChange}
              style={errors.Category ? styles.inputError : styles.select}
              disabled={loading}
            >
              <option value="">Select Category</option>
              {bedCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.Category && <span style={styles.errorMessage}>{errors.Category}</span>}
          </div>
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
          {loading ? 'Saving...' : initialData ? 'Update Bed' : 'Create Bed'}
        </button>
      </div>
    </form>
  );
}

export default BedForm;
