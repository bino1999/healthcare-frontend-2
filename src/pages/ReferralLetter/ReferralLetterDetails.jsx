function ReferralLetterDetails({ letters = [], loading = false, error = '' }) {
  const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  };

  const resolveCreatedBy = (letter) => {
    const user = letter?.user_created;
    if (!user || typeof user !== 'object') return 'N/A';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
  };

  const resolveDoctorName = (letter) => {
    const doctor = letter?.doctor;
    if (!doctor || typeof doctor !== 'object') return 'N/A';
    const user = doctor.user_id;
    if (user && typeof user === 'object') {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
    }
    return 'N/A';
  };

  if (loading) {
    return <div className="loading">Loading referral letters...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!letters.length) {
    return <div className="empty-state">No referral letters available.</div>;
  }

  return (
    <div className="detail-groups">
      {letters.map((letter) => (
        <div key={letter.id} className="detail-group">
          <h4 className="detail-group-title">
            Referral Letter {letter.refferal_date || letter.referral_date ? `- ${formatDate(letter.refferal_date || letter.referral_date)}` : ''}
          </h4>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">From</span>
              <span className="detail-value">{resolveCreatedBy(letter)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Referred Doctor</span>
              <span className="detail-value">{resolveDoctorName(letter)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Referral Date</span>
              <span className="detail-value">{formatDate(letter.refferal_date || letter.referral_date)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Referral Reason</span>
              <span className="detail-value">{letter?.referral_reason || 'N/A'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReferralLetterDetails;
