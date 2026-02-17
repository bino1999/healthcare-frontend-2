import ReferralLetterForm from '../../ReferralLetter/ReferralLetterForm';
import ReferralLetterDetails from '../../ReferralLetter/ReferralLetterDetails';
import DetailSection from '../DetailSection';

function ReferralsPanel({ referralLetters, referralLoading, referralError, canManageClinical, showCreateReferral, setShowCreateReferral, handleCreateReferral, savingSection, patientId }) {
  return (
    <DetailSection title="Referral Letters" subtitle="Referral history for this patient" isEditing={false} onEdit={() => {}} showEdit={false}>
      {canManageClinical && !showCreateReferral && (
        <div className="detail-actions">
          <button type="button" className="icon-button" onClick={() => setShowCreateReferral(true)}>
            <span className="icon">+</span>
            Create Referral Letter
          </button>
        </div>
      )}

      {canManageClinical && showCreateReferral && (
        <ReferralLetterForm patientId={patientId} onSubmit={handleCreateReferral} onCancel={() => setShowCreateReferral(false)} loading={savingSection === 'create-referral'} />
      )}

      <ReferralLetterDetails letters={referralLetters} loading={referralLoading} error={referralError} />
    </DetailSection>
  );
}

export default ReferralsPanel;
