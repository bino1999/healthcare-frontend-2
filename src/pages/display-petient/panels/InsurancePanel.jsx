import InsuranceForm from '../../forms/InsuranceForm';
import SectionSearch from '../SectionSearch';
import DetailGrid from '../DetailGrid';
import DetailSection from '../DetailSection';

function InsurancePanel({
  insurance,
  admission,
  patient,
  canManageClinical,
  showAllInsuranceFields,
  setShowAllInsuranceFields,
  showAdvancedInsurance,
  setShowAdvancedInsurance,
  insuranceSearch,
  setInsuranceSearch,
  editingSection,
  setEditingSection,
  savingSection,
  handleInsuranceSubmit,
  showCreateInsurance,
  setShowCreateInsurance,
  handleCreateInsurance,
  insuranceSections,
  requiresInsurance
}) {
  return (
    <DetailSection
      title="Insurance Details"
      subtitle="Full insurance record"
      isEditing={editingSection === 'insurance'}
      onEdit={() => setEditingSection(editingSection === 'insurance' ? null : 'insurance')}
      showEdit={Boolean(insurance) && canManageClinical}
    >
      {insurance ? (
        editingSection === 'insurance' && canManageClinical ? (
          <InsuranceForm patientId={patient.id} initialData={insurance} onSubmit={handleInsuranceSubmit} onCancel={() => setEditingSection(null)} loading={savingSection === 'insurance'} />
        ) : (
          <>
            <div className="detail-actions">
              <button className="toggle-btn" onClick={() => setShowAllInsuranceFields(p => !p)}>
                {showAllInsuranceFields ? 'Hide empty fields' : 'Show empty fields'}
              </button>
              <button className="toggle-btn" onClick={() => setShowAdvancedInsurance(p => !p)}>
                {showAdvancedInsurance ? 'Hide advanced' : 'Show advanced'}
              </button>
            </div>
            <SectionSearch value={insuranceSearch} onChange={setInsuranceSearch} placeholder="Search insurance details" />
            <div className="insurance-section-groups">
              {insuranceSections.map((section, idx) => {
                if (section.advanced && !showAdvancedInsurance) return null;
                const items = showAllInsuranceFields ? section.items : section.items.filter(i => !(Array.isArray(i.value) ? i.value.length === 0 : (i.value === null || i.value === undefined || i.value === '')));
                const filtered = insuranceSearch ? items.filter(item => (`${item.label} ${item.value ?? ''}`).toLowerCase().includes(insuranceSearch.toLowerCase())) : items;
                if (filtered.length === 0) return null;
                return (
                  <div key={section.title} className="insurance-section">
                    <div className="insurance-section-title">{section.title}</div>
                    <div className="insurance-section-items">
                      <DetailGrid items={filtered} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )
      ) : requiresInsurance ? (
        showCreateInsurance && canManageClinical ? (
          <InsuranceForm patientId={patient.id} onSubmit={handleCreateInsurance} onCancel={() => setShowCreateInsurance(false)} loading={savingSection === 'create-insurance'} onSkip={() => setShowCreateInsurance(false)} />
        ) : (
          <div className="empty-state">
            This patient has no insurance record yet.
            {canManageClinical && (
              <button type="button" className="btn-primary" style={{ marginTop: 12 }} onClick={() => setShowCreateInsurance(true)}>
                + Create Insurance
              </button>
            )}
          </div>
        )
      ) : (
        <div className="empty-state">Insurance is required only for Guarantee Letter admissions.</div>
      )}
    </DetailSection>
  );
}

export default InsurancePanel;
