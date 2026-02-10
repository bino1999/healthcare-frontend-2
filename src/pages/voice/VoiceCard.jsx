import React from 'react';

function VoiceCard({ patient, onClose }) {
  if (!patient) return null;

  const admission = Array.isArray(patient.patient_Admission)
    ? patient.patient_Admission[0]
    : patient.patient_Admission || null;
  const insurance = Array.isArray(patient.insurance)
    ? patient.insurance[0]
    : patient.insurance || null;
  const bed = Array.isArray(patient.patient_bed)
    ? patient.patient_bed[0]
    : patient.patient_bed || null;

  return (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.name}>{patient.patient_name}</h2>
            <div style={styles.meta}>MRN: {patient.mrn || 'N/A'}</div>
          </div>
          <button onClick={onClose} style={styles.close} aria-label="Close">✕</button>
        </div>

        <div style={styles.grid}>
          <div style={styles.infoCard}>
            <div style={styles.infoTitle}>Admission</div>
            <div style={styles.infoValue}>{admission?.status || 'N/A'}</div>
            <div style={styles.infoSub}>Op Date: {admission?.operation_date ? new Date(admission.operation_date).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoTitle}>Insurance</div>
            <div style={styles.infoValue}>{insurance?.tpa_name || 'Self-Pay'}</div>
            <div style={styles.infoSub}>IGL: {insurance?.IGL_status || 'N/A'}</div>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoTitle}>Bed</div>
            <div style={styles.infoValue}>{bed?.bed_no || 'N/A'}</div>
            <div style={styles.infoSub}>{bed?.select_ward?.ward_name || ''}</div>
          </div>
        </div>

        <div style={styles.contactRow}>
          <div>
            <div style={styles.contactTitle}>Contact</div>
            <div style={styles.contactValue}>{patient.contact_number || 'N/A'}</div>
            <div style={styles.contactValue}>{patient.email || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1200,
    padding: 20
  },
  card: {
    background: '#ffffff',
    borderRadius: 12,
    width: 820,
    maxWidth: '100%',
    padding: 22,
    boxShadow: '0 12px 40px rgba(2,6,23,0.2)',
    color: '#0f172a'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18
  },
  name: { margin: 0, fontSize: 22, color: '#0b1220' },
  meta: { color: '#475569', fontSize: 14, marginTop: 6 },
  close: { background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#0b1220' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 },
  infoCard: { background: '#f8fafc', padding: 14, borderRadius: 10, minHeight: 84 },
  infoTitle: { color: '#64748b', fontSize: 13, marginBottom: 6 },
  infoValue: { color: '#0b1220', fontSize: 16, fontWeight: 700 },
  infoSub: { color: '#64748b', fontSize: 13, marginTop: 6 },
  contactRow: { marginTop: 18 },
  contactTitle: { color: '#64748b', fontSize: 13 },
  contactValue: { color: '#0b1220', fontSize: 15, marginTop: 6 }
};

export default VoiceCard;
