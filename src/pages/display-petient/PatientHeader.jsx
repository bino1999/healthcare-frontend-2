function PatientHeader({ title, subtitle, onBack, chips = [], actions = null }) {
  return (
    <div className="display-header">
      <button onClick={onBack} className="btn-secondary">
        ← Back
      </button>
      <div className="header-content">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {chips.length > 0 && (
          <div className="summary-chips">
            {chips.map((chip) => (
              <span key={chip.label} className="summary-chip">
                <span className="summary-chip-label">{chip.label}</span>
                <span className="summary-chip-value">{chip.value}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="header-actions">{actions}</div>
    </div>
  );
}

export default PatientHeader;
