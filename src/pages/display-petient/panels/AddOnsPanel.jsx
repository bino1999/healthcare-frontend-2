import AddOnProceduresForm from '../../Add_on_Procedures/AddOnProceduresForm';
import AddOnProceduresDetails from '../../Add_on_Procedures/AddOnProceduresDetails';
import DetailSection from '../DetailSection';

function AddOnsPanel({ addOnProcedures, addOnLoading, addOnError, canManageClinical, showCreateAddOn, setShowCreateAddOn, handleCreateAddOnProcedure, savingSection, patientId }) {
  return (
    <DetailSection title="Add-on Procedures" subtitle="Procedures linked to this patient" isEditing={false} onEdit={() => {}} showEdit={false}>
      {canManageClinical && !showCreateAddOn && (
        <div className="detail-actions">
          <button type="button" className="icon-button" onClick={() => setShowCreateAddOn(true)}>
            <span className="icon">+</span>
            Create Add-on Procedure
          </button>
        </div>
      )}

      {canManageClinical && showCreateAddOn && (
        <AddOnProceduresForm patientId={patientId} onSubmit={handleCreateAddOnProcedure} onCancel={() => setShowCreateAddOn(false)} loading={savingSection === 'create-add-on'} />
      )}

      <AddOnProceduresDetails procedures={addOnProcedures} loading={addOnLoading} error={addOnError} />
    </DetailSection>
  );
}

export default AddOnsPanel;
