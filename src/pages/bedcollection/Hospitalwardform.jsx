// src/pages/HospitalWard/HospitalWardForm.jsx
import { useEffect, useState } from 'react';

function HospitalWardForm({ onSubmit, onCancel, loading, initialData = null }) {
  const [wardData, setWardData] = useState({
    ward_name: initialData?.ward_name || '',
    ward_code: initialData?.ward_code || '',
    ward_type_: initialData?.ward_type_ || '',
    is_critical_care: initialData?.is_critical_care || '',
    floor_number_: initialData?.floor_number_ || '',
    building_block: initialData?.building_block || '',
    physical_location_notes: initialData?.physical_location_notes || '',
    room_types_available: initialData?.room_types_available || []
  });

  useEffect(() => {
    setWardData({
      ward_name: initialData?.ward_name || '',
      ward_code: initialData?.ward_code || '',
      ward_type_: initialData?.ward_type_ || '',
      is_critical_care: initialData?.is_critical_care || '',
      floor_number_: initialData?.floor_number_ || '',
      building_block: initialData?.building_block || '',
      physical_location_notes: initialData?.physical_location_notes || '',
      room_types_available: initialData?.room_types_available || []
    });
  }, [initialData]);

  const [errors, setErrors] = useState({});

  // Dropdown options based on your Directus images
  const wardTypeOptions = [
    'ICU',
    'NICU',
    'CCU',
    'HDU',
    'Maternity',
    'Daycare',
    'Paediatric',
    'General',
    'Other'
  ];

  const roomTypeOptions = [
    'Single Room',
    'Twin-Sharing',
    'Four-Bedded',
    'Open Bay'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWardData({
      ...wardData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCheckbox = (value) => {
    setWardData(prev => {
      const currentValues = prev.room_types_available || [];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          room_types_available: currentValues.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          room_types_available: [...currentValues, value]
        };
      }
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!wardData.ward_name.trim()) {
      newErrors.ward_name = 'Ward name is required';
    }
    if (!wardData.ward_code.trim()) {
      newErrors.ward_code = 'Ward code is required';
    }
    if (!wardData.ward_type_) {
      newErrors.ward_type_ = 'Ward type is required';
    }
    if (!wardData.is_critical_care) {
      newErrors.is_critical_care = 'Critical care status is required';
    }
    if (!wardData.floor_number_.trim()) {
      newErrors.floor_number_ = 'Floor number is required';
    }
    if (!wardData.building_block.trim()) {
      newErrors.building_block = 'Building/Block is required';
    }
    if (wardData.room_types_available.length === 0) {
      newErrors.room_types_available = 'Select at least one room type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        ward_name: wardData.ward_name,
        ward_code: wardData.ward_code,
        ward_type_: wardData.ward_type_,
        is_critical_care: wardData.is_critical_care,
        floor_number_: wardData.floor_number_,
        building_block: wardData.building_block,
        physical_location_notes: wardData.physical_location_notes || null,
        room_types_available: wardData.room_types_available
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
    subTitle: {
      color: '#2c3e50',
      marginTop: '25px',
      marginBottom: '15px',
      fontSize: '1.1rem',
      fontWeight: '600'
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
      minHeight: '100px',
      resize: 'vertical'
    },
    errorMessage: {
      color: '#e74c3c',
      fontSize: '0.85rem',
      marginTop: '5px',
      display: 'block'
    },
    radioGroup: {
      display: 'flex',
      flexDirection: 'row',
      gap: '20px',
      flexWrap: 'wrap'
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '10px',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      minWidth: '100px'
    },
    radio: {
      marginRight: '10px',
      cursor: 'pointer',
      accentColor: '#3498db',
      width: '18px',
      height: '18px'
    },
    checkboxGroup: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginTop: '10px'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '12px',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      backgroundColor: 'white'
    },
    checkboxLabelChecked: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '12px',
      border: '2px solid #3498db',
      borderRadius: '4px',
      backgroundColor: '#ebf5fb',
      transition: 'all 0.2s ease'
    },
    checkbox: {
      marginRight: '10px',
      cursor: 'pointer',
      accentColor: '#3498db',
      width: '18px',
      height: '18px'
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
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.formSection}>
        <h2 style={styles.sectionTitle}>Hospital Ward Information</h2>
        
        <div style={styles.infoBox}>
          <strong>Note:</strong> Only administrators and hospital staff can create and manage wards and beds.
        </div>

        {/* Basic Information */}
        <h3 style={styles.subTitle}>Basic Information</h3>
        
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Ward Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="ward_name"
              value={wardData.ward_name}
              onChange={handleChange}
              style={errors.ward_name ? styles.inputError : styles.input}
              placeholder="e.g., Intensive Care Unit"
              disabled={loading}
            />
            {errors.ward_name && <span style={styles.errorMessage}>{errors.ward_name}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Ward Code <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="ward_code"
              value={wardData.ward_code}
              onChange={handleChange}
              style={errors.ward_code ? styles.inputError : styles.input}
              placeholder="e.g., ICU"
              disabled={loading}
            />
            {errors.ward_code && <span style={styles.errorMessage}>{errors.ward_code}</span>}
          </div>
        </div>

        {/* Ward Classification */}
        <h3 style={styles.subTitle}>Ward Classification</h3>
        
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Ward Type <span style={styles.required}>*</span>
            </label>
            <select
              name="ward_type_"
              value={wardData.ward_type_}
              onChange={handleChange}
              style={errors.ward_type_ ? styles.inputError : styles.select}
              disabled={loading}
            >
              <option value="">Select Ward Type</option>
              {wardTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.ward_type_ && <span style={styles.errorMessage}>{errors.ward_type_}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Is Critical Care <span style={styles.required}>*</span>
            </label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="is_critical_care"
                  value="Yes"
                  checked={wardData.is_critical_care === 'Yes'}
                  onChange={handleChange}
                  style={styles.radio}
                  disabled={loading}
                />
                Yes
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="is_critical_care"
                  value="No"
                  checked={wardData.is_critical_care === 'No'}
                  onChange={handleChange}
                  style={styles.radio}
                  disabled={loading}
                />
                No
              </label>
            </div>
            {errors.is_critical_care && <span style={styles.errorMessage}>{errors.is_critical_care}</span>}
          </div>
        </div>

        {/* Location Details */}
        <h3 style={styles.subTitle}>Location Details</h3>
        
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Floor Number <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="floor_number_"
              value={wardData.floor_number_}
              onChange={handleChange}
              style={errors.floor_number_ ? styles.inputError : styles.input}
              placeholder="e.g., 2 or Ground Floor"
              disabled={loading}
            />
            {errors.floor_number_ && <span style={styles.errorMessage}>{errors.floor_number_}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Building/Block <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="building_block"
              value={wardData.building_block}
              onChange={handleChange}
              style={errors.building_block ? styles.inputError : styles.input}
              placeholder="e.g., Main Building"
              disabled={loading}
            />
            {errors.building_block && <span style={styles.errorMessage}>{errors.building_block}</span>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Physical Location Notes</label>
          <textarea
            name="physical_location_notes"
            value={wardData.physical_location_notes}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="e.g., Located near the main lift lobby, east wing"
            disabled={loading}
          />
        </div>

        {/* Room Types Available */}
        <h3 style={styles.subTitle}>Room Types Available</h3>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Select Room Types <span style={styles.required}>*</span>
          </label>
          <div style={styles.checkboxGroup}>
            {roomTypeOptions.map(type => (
              <label 
                key={type} 
                style={
                  wardData.room_types_available.includes(type) 
                    ? styles.checkboxLabelChecked 
                    : styles.checkboxLabel
                }
              >
                <input
                  type="checkbox"
                  value={type}
                  checked={wardData.room_types_available.includes(type)}
                  onChange={() => handleCheckbox(type)}
                  style={styles.checkbox}
                  disabled={loading}
                />
                {type}
              </label>
            ))}
          </div>
          {errors.room_types_available && (
            <span style={styles.errorMessage}>{errors.room_types_available}</span>
          )}
        </div>
      </div>

      {/* Form Actions */}
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
          {loading ? 'Creating...' : initialData ? 'Update Ward' : 'Create Ward'}
        </button>
      </div>
    </form>
  );
}

export default HospitalWardForm;