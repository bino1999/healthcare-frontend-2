function PatientSummaryCard({ patient, admission, insurance }) {
  return (
    <section className="summary-card">
      <div className="summary-main">
        <div>
          <h1 className="patient-name">{patient?.patient_name || 'Patient'}</h1>
          <p className="patient-meta">MRN: {patient?.mrn || 'N/A'}</p>
        </div>
        <div className="summary-badges">
          <div className="badge-group">
            <span className="badge-label">Admission</span>
            <span className={`badge status-${admission?.status || 'unknown'}`}>
              {admission?.status || 'N/A'}
            </span>
          </div>
          <div className="badge-group">
            <span className="badge-label">IGL Status</span>
            <span className={`badge igl-${insurance?.IGL_status || 'unknown'}`}>
              {insurance?.IGL_status || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PatientSummaryCard;
