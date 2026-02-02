import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatient, updatePatientAdmission, updateBedStatus, assignBedToPatient, updatePatientInsurance, createReferralLetter, createAddOnProcedure } from '../api/patients';
import { isAdmin, isDoctor, isStaff } from '../utils/auth';
import Navbar from '../components/Navbar';
import { getUser } from '../utils/auth';

function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(null); // null, 'patient', 'admission', 'bed', 'insurance'

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    setLoading(true);
    try {
      const data = await getPatient(id);
      setPatient(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isAdmin()) navigate('/admin-dashboard');
    else if (isDoctor()) navigate('/doctor-dashboard');
    else if (isStaff()) navigate('/staff-dashboard');
  };

  const canEditPatient = isAdmin() || isDoctor();
  const canEditBed = isAdmin() || isStaff();
  const canEditAdmission = isAdmin() || isDoctor();
  const canEditInsurance = isAdmin() || isDoctor();
  const canAddReferral = isAdmin() || isDoctor();
  const canAddProcedure = isAdmin() || isDoctor();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="loading">Loading patient details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!patient) return <div className="error-message">Patient not found</div>;

  // Helper functions to safely access related data
  const admission = Array.isArray(patient.patient_Admission) 
    ? patient.patient_Admission[0] 
    : patient.patient_Admission;
  
  const insurance = Array.isArray(patient.insurance) 
    ? patient.insurance[0] 
    : patient.insurance;
  
  const bed = Array.isArray(patient.patient_bed) 
    ? patient.patient_bed[0] 
    : patient.patient_bed;

  const referralLetters = Array.isArray(patient.Referral_Letter) 
    ? patient.Referral_Letter 
    : [];

  const procedures = Array.isArray(patient.Add_on_Procedures) 
    ? patient.Add_on_Procedures 
    : [];

  return (
    <div>
      <Navbar user={user} />
      
      <div className="page-container">
        <div className="page-header">
          <button onClick={handleBack} className="btn-secondary">← Back</button>
          <h1>Patient Details</h1>
          <div></div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="patient-detail-container">
          {/* PATIENT INFORMATION SECTION */}
          <section className="detail-section">
            <div className="section-header">
              <h2>Patient Information</h2>
              {canEditPatient && (
                <button 
                  onClick={() => setEditMode(editMode === 'patient' ? null : 'patient')}
                  className="btn-small"
                >
                  {editMode === 'patient' ? 'Cancel' : 'Edit'}
                </button>
              )}
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <label>Medical Record Number (MRN)</label>
                <p>{patient.mrn}</p>
              </div>
              <div className="detail-item">
                <label>Patient Name</label>
                <p>{patient.patient_name}</p>
              </div>
              <div className="detail-item">
                <label>Date of Birth</label>
                <p>{formatDate(patient.date_of_birth)}</p>
              </div>
              <div className="detail-item">
                <label>NRIC</label>
                <p>{patient.NRIC}</p>
              </div>
              <div className="detail-item">
                <label>Gender</label>
                <p>{patient.gender}</p>
              </div>
              <div className="detail-item">
                <label>Contact Number</label>
                <p>{patient.contact_number}</p>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <p>{patient.email || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Created By</label>
                <p>
                  {patient.created_doctor?.first_name} {patient.created_doctor?.last_name}
                </p>
              </div>
            </div>
          </section>

          {/* ADMISSION DETAILS SECTION */}
          {admission && (
            <section className="detail-section">
              <div className="section-header">
                <h2>Admission Details</h2>
                {canEditAdmission && (
                  <button 
                    onClick={() => setEditMode(editMode === 'admission' ? null : 'admission')}
                    className="btn-small"
                  >
                    {editMode === 'admission' ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Status</label>
                  <p>
                    <span className={`status-badge status-${admission.status || 'unknown'}`}>
                      {admission.status || 'N/A'}
                    </span>
                  </p>
                </div>
                <div className="detail-item">
                  <label>Admission Date</label>
                  <p>{formatDate(admission.admission_date)}</p>
                </div>
                <div className="detail-item">
                  <label>Operation Date</label>
                  <p>{formatDate(admission.operation_date)}</p>
                </div>
                <div className="detail-item">
                  <label>Operation Time</label>
                  <p>{admission.operation_time || 'N/A'}</p>
                </div>
              </div>
            </section>
          )}

          {/* BED ASSIGNMENT SECTION */}
          {bed && (
            <section className="detail-section">
              <div className="section-header">
                <h2>Bed Assignment</h2>
                {canEditBed && (
                  <button 
                    onClick={() => setEditMode(editMode === 'bed' ? null : 'bed')}
                    className="btn-small"
                  >
                    {editMode === 'bed' ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Bed Number</label>
                  <p>{bed.bed_no || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Bed Status</label>
                  <p>
                    <span className={`badge badge-${bed.status || 'unknown'}`}>
                      {bed.status || 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* INSURANCE SECTION */}
          {insurance && (
            <section className="detail-section">
              <div className="section-header">
                <h2>Insurance Information</h2>
                {canEditInsurance && (
                  <button 
                    onClick={() => setEditMode(editMode === 'insurance' ? null : 'insurance')}
                    className="btn-small"
                  >
                    {editMode === 'insurance' ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Insurance Company (TPA)</label>
                  <p>{insurance.tpa_name || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>IGL Status</label>
                  <p>
                    <span className={`igl-status ${insurance.IGL_status || ''}`}>
                      {insurance.IGL_status || 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* REFERRAL LETTERS SECTION */}
          {(canAddReferral || referralLetters.length > 0) && (
            <section className="detail-section">
              <div className="section-header">
                <h2>Referral Letters</h2>
                {canAddReferral && (
                  <button 
                    onClick={() => setEditMode(editMode === 'referral' ? null : 'referral')}
                    className="btn-small"
                  >
                    {editMode === 'referral' ? 'Cancel' : '+ Add'}
                  </button>
                )}
              </div>

              {referralLetters.length > 0 ? (
                <div className="list-container">
                  {referralLetters.map((letter) => (
                    <div key={letter.id} className="list-item">
                      <div>
                        <p><strong>{letter.referral_to || 'Referral'}</strong></p>
                        <p className="text-muted">{formatDate(letter.referral_date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No referral letters added yet.</p>
              )}
            </section>
          )}

          {/* ADD-ON PROCEDURES SECTION */}
          {(canAddProcedure || procedures.length > 0) && (
            <section className="detail-section">
              <div className="section-header">
                <h2>Add-on Procedures</h2>
                {canAddProcedure && (
                  <button 
                    onClick={() => setEditMode(editMode === 'procedure' ? null : 'procedure')}
                    className="btn-small"
                  >
                    {editMode === 'procedure' ? 'Cancel' : '+ Add'}
                  </button>
                )}
              </div>

              {procedures.length > 0 ? (
                <div className="list-container">
                  {procedures.map((proc) => (
                    <div key={proc.id} className="list-item">
                      <div>
                        <p><strong>{proc.procedure_name || 'Procedure'}</strong></p>
                        <p className="text-muted">{proc.procedure_description || 'No description'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No procedures added yet.</p>
              )}
            </section>
          )}
        </div>
      </div>

      <style>{`
        .patient-detail-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .detail-section {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #007bff;
          padding-bottom: 1rem;
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #333;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-item label {
          font-weight: 600;
          color: #555;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .detail-item p {
          margin: 0;
          color: #333;
          padding: 0.5rem;
          background: white;
          border-radius: 4px;
        }

        .list-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .list-item {
          background: white;
          padding: 1rem;
          border-left: 4px solid #007bff;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-item p {
          margin: 0;
        }

        .text-muted {
          color: #999;
          font-size: 0.9rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-admitted {
          background: #d4edda;
          color: #155724;
        }

        .status-discharged {
          background: #e2e3e5;
          color: #383d41;
        }

        .status-unknown {
          background: #f8d7da;
          color: #721c24;
        }

        .badge {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .badge-occupied {
          background: #f8d7da;
          color: #721c24;
        }

        .badge-available {
          background: #d4edda;
          color: #155724;
        }

        .igl-status {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .igl-status {
          background: #cfe2ff;
          color: #084298;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .btn-small:hover {
          background: #0056b3;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .page-header h1 {
          margin: 0;
          flex: 1;
          text-align: center;
        }

        .btn-secondary {
          padding: 0.5rem 1rem;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }
      `}</style>
    </div>
  );
}

export default PatientDetailPage;
