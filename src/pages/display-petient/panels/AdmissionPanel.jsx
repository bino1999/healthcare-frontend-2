import AdmissionForm from '../../forms/AdmissionForm';
import SectionSearch from '../SectionSearch';
import DetailGrid from '../DetailGrid';
import DetailSection from '../DetailSection';

function AdmissionPanel({
  admission,
  patient,
  canManageClinical,
  showAllAdmissionFields,
  setShowAllAdmissionFields,
  // Removed showAdvancedAdmission and setShowAdvancedAdmission
  admissionSearch,
  setAdmissionSearch,
  editingSection,
  setEditingSection,
  savingSection,
  handleAdmissionSubmit,
  showCreateAdmission,
  setShowCreateAdmission,
  handleCreateAdmission,
  admissionSections
}) {
  return (
    <DetailSection
      title="Admission Details"
      subtitle="Full admission record"
      isEditing={editingSection === 'admission'}
      onEdit={() => setEditingSection(editingSection === 'admission' ? null : 'admission')}
      showEdit={Boolean(admission)}
    >
      {admission ? (
        editingSection === 'admission' ? (
          <AdmissionForm
            patientId={patient.id}
            initialData={admission}
            onSubmit={handleAdmissionSubmit}
            onCancel={() => setEditingSection(null)}
            loading={savingSection === 'admission'}
          />
        ) : (
          <>
            <div className="detail-actions">
              <button className="toggle-btn" onClick={() => setShowAllAdmissionFields((p) => !p)}>
                {/* Removed Hide empty fields button */}
              </button>
              {/* Removed Show advanced button */}
            </div>
            <SectionSearch value={admissionSearch} onChange={setAdmissionSearch} placeholder="Search admission details" />
            <div className="detail-groups">
              {admissionSections.map((section) => {
                // Removed advanced logic; always show filtered sections
                const items = showAllAdmissionFields ? section.items : section.items.filter(i => !(Array.isArray(i.value) ? i.value.length === 0 : (i.value === null || i.value === undefined || i.value === '')));
                const filtered = admissionSearch ? items.filter(item => (`${item.label} ${item.value ?? ''}`).toLowerCase().includes(admissionSearch.toLowerCase())) : items;
                if (filtered.length === 0) return null;
                return (
                  <div key={section.title} className="detail-group">
                    <h4 className="detail-group-title">{section.title}</h4>
                    <DetailGrid items={filtered} />
                  </div>
                );
              })}
            </div>
          </>
        )
      ) : showCreateAdmission ? (
        <AdmissionForm patientId={patient.id} onSubmit={handleCreateAdmission} onCancel={() => setShowCreateAdmission(false)} loading={savingSection === 'create-admission'} />
      ) : (
        <div className="empty-state">
          This patient has no admission record yet.
          {canManageClinical && (
            <button type="button" className="btn-primary" style={{ marginTop: 12 }} onClick={() => setShowCreateAdmission(true)}>
              + Create Admission
            </button>
          )}
        </div>
      )}
    </DetailSection>
  );
}

export default AdmissionPanel;
