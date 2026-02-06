// src/pages/GeneratePAF/GeneratePafModal.jsx
import React from 'react';
import { useGeneratePAF } from './useGeneratePAF';
import './GeneratePAF.css';

export default function GeneratePafModal({ patient, admission, insurance, onClose }) {
  const { loading, error, success, response, generate, reset } = useGeneratePAF();

  // Build preview data
  const previewData = [
    { label: 'Patient Name', value: patient?.patient_name || 'N/A' },
    { label: 'MRN', value: patient?.mrn || 'N/A' },
    { label: 'NRIC', value: patient?.NRIC || 'N/A' },
    { label: 'Date of Birth', value: patient?.date_of_birth || 'N/A' },
    { label: 'Gender', value: patient?.gender || 'N/A' },
    { label: 'Contact', value: patient?.contact_number || 'N/A' },
    { label: 'Email', value: patient?.email || 'N/A' },
    { label: 'Insurance', value: insurance?.tpa_name || 'No Insurance' },
    { label: 'Doctor', value: admission?.user_created?.first_name && admission?.user_created?.last_name
        ? `${admission.user_created.first_name} ${admission.user_created.last_name}`
        : 'N/A'
    },
  ];

  const handleGenerate = async () => {
    const result = await generate(patient, admission, insurance);
    if (result.success) {
      // Optionally auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="paf-modal-overlay" onClick={handleClose}>
      <div className="paf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="paf-modal-header">
          <h3>Generate Pre-Authorization Form (PAF)</h3>
          <button className="paf-modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="paf-modal-body">
          {error && (
            <div className="paf-error">
              {error}
            </div>
          )}
          
          {success && (
            <div className="paf-success">
              <span className="paf-success-icon">✓</span>
              PAF generated successfully!
            </div>
          )}

          <div className="paf-preview">
            <div className="paf-preview-title">Data to be submitted</div>
            {previewData.map((item, index) => (
              <div key={index} className="paf-preview-item">
                <span className="paf-preview-label">{item.label}</span>
                <span className="paf-preview-value" title={item.value}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="paf-modal-footer">
          <button className="paf-btn paf-btn-cancel" onClick={handleClose}>
            {success ? 'Close' : 'Cancel'}
          </button>
          {!success && (
            <button
              className="paf-btn paf-btn-generate"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <span className="paf-loading">
                  <span className="paf-spinner"></span>
                  Generating...
                </span>
              ) : (
                'Generate PAF'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
