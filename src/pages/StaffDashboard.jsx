// src/pages/StaffDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth';
import { initAuth } from '../api/auth';
import { assignBedToPatient, getPatients, updateAdmissionRecord } from '../api/patients';
import Navbar from '../components/Navbar';
import AssignBedModal from './bedcollection/AssignBedModal';
import AdmissionStatusModal from '../components/AdmissionStatusModal';
import IglStatusPieChart from './charts/IglStatusPieChart';
import AdmissionStatusPieChart from './charts/AdmissionStatusPieChart';
import FiltersBar from './dashboard-widgets/FiltersBar';
import KpiCards from './dashboard-widgets/KpiCards';

function StaffDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [selectedStatusPatient, setSelectedStatusPatient] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initialize = async () => {
      // First, try to restore authentication
      const authenticatedUser = await initAuth();
      
      if (!authenticatedUser) {
        navigate('/login');
        return;
      }
      
      if (authenticatedUser.role?.name !== 'Hospital_staff' && authenticatedUser.role?.name !== 'Hospital Staff') {
        navigate('/dashboard');
        return;
      }
      
      setUser(authenticatedUser);
      setInitializing(false);
    };

    initialize();
  }, [navigate]);

  useEffect(() => {
    if (!user || initializing) return;

    fetchPatients();
  }, [user, initializing]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getLatestAdmission = (admissions) => {
    if (!admissions || admissions.length === 0) return null;
    if (!Array.isArray(admissions)) return admissions;
    return admissions.sort((a, b) => 
      new Date(b.admission_date) - new Date(a.admission_date)
    )[0];
  };

  const getBed = (bed) => {
    if (!bed) return null;
    if (!Array.isArray(bed)) return bed;
    return bed[0] || null;
  };

  const getInsurance = (insurance) => {
    if (!insurance) return null;
    if (!Array.isArray(insurance)) return insurance;
    return insurance[0] || null;
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      if (normalizedSearch) {
        const searchTarget = `${patient.patient_name || ''} ${patient.mrn || ''}`.toLowerCase();
        if (!searchTarget.includes(normalizedSearch)) return false;
      }

      return true;
    });
  }, [patients, normalizedSearch]);

  const iglChartData = useMemo(() => {
    const counts = { Pending: 0, Approved: 0, Rejected: 0 };
    filteredPatients.forEach((patient) => {
      const insurance = getInsurance(patient.insurance);
      const status = (insurance?.IGL_status || '').toLowerCase();
      if (status.includes('reject')) counts.Rejected += 1;
      else if (status.includes('approve')) counts.Approved += 1;
      else counts.Pending += 1;
    });
    return [
      { name: 'Pending', value: counts.Pending },
      { name: 'Approved', value: counts.Approved },
      { name: 'Rejected', value: counts.Rejected }
    ];
  }, [filteredPatients]);

  const admissionChartData = useMemo(() => {
    const counts = { Admitted: 0, Pending: 0, Discharge: 0 };
    filteredPatients.forEach((patient) => {
      const admission = getLatestAdmission(patient.patient_Admission);
      const status = (admission?.status || '').toLowerCase();
      if (status.includes('admitted')) counts.Admitted += 1;
      else if (status.includes('pending')) counts.Pending += 1;
      else if (status.includes('discharge')) counts.Discharge += 1;
      else counts.Pending += 1;
    });
    return [
      { name: 'Admitted', value: counts.Admitted },
      { name: 'Pending', value: counts.Pending },
      { name: 'Discharge', value: counts.Discharge }
    ];
  }, [filteredPatients]);

  const kpiData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const pendingCount = filteredPatients.filter((patient) => {
      const admission = getLatestAdmission(patient.patient_Admission);
      return (admission?.status || '').toLowerCase().includes('pending');
    }).length;

    const admittedCount = filteredPatients.filter((patient) => {
      const admission = getLatestAdmission(patient.patient_Admission);
      return (admission?.status || '').toLowerCase().includes('admitted');
    }).length;

    const iglApproved = filteredPatients.filter((patient) => {
      const insurance = getInsurance(patient.insurance);
      const status = (insurance?.IGL_status || '').toLowerCase();
      return status.includes('approve');
    }).length;

    return [
      { label: 'Number of Patients', value: filteredPatients.length },
      { label: 'IGL Approved', value: iglApproved },
      { label: 'Total Admitted', value: admittedCount },
      { label: 'Total Admission Pending', value: pendingCount }
    ];
  }, [filteredPatients]);

  const handleOpenAssign = (patient) => {
    setSelectedPatient(patient);
    setAssignError('');
    setAssignModalOpen(true);
  };

  const handleOpenStatus = (patient, admission) => {
    if (!admission?.id) return;
    setSelectedStatusPatient(patient);
    setSelectedAdmission(admission);
    setStatusError('');
    setStatusModalOpen(true);
  };

  const handleStatusSave = async (newStatus) => {
    if (!selectedAdmission?.id) return;
    setStatusUpdating(true);
    setStatusError('');
    try {
      await updateAdmissionRecord(selectedAdmission.id, { status: newStatus });
      setStatusModalOpen(false);
      setSelectedAdmission(null);
      setSelectedStatusPatient(null);
      await fetchPatients();
    } catch (err) {
      setStatusError(err.message || 'Failed to update admission status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssignBed = async (bed) => {
    if (!selectedPatient) return;
    setAssigning(true);
    setAssignError('');
    try {
      await assignBedToPatient(selectedPatient.id, bed.id);
      setAssignModalOpen(false);
      setSelectedPatient(null);
      await fetchPatients();
    } catch (err) {
      setAssignError(err.message || 'Failed to assign bed');
    } finally {
      setAssigning(false);
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div>
      <Navbar user={user} />
      
      <div className="page-container">
        <div className="page-header">
          <h1>Staff Dashboard - Patients</h1>
          <button
            onClick={() => navigate('/ward-management')}
            className="btn-secondary"
          >
            Ward & Bed Management
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <FiltersBar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search by patient name" />

        <KpiCards items={kpiData} />

        <div className="dashboard-charts">
          <IglStatusPieChart data={iglChartData} />
          <AdmissionStatusPieChart data={admissionChartData} />
        </div>

        {loading ? (
          <div className="loading">Loading patients...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>MRN</th>
                  <th>Bed No</th>
                  <th>Bed Status</th>
                  <th>Status</th>
                  <th>Insurance Company</th>
                  <th>IGL Status</th>
                  <th>Policy Number</th>
                  <th>IGL Number</th>
                  <th>Date Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const insurance = getInsurance(patient.insurance);
                    const admission = getLatestAdmission(patient.patient_Admission);
                    const bed = getBed(patient.patient_bed);
                    const canAssignBed = admission?.status === 'Admission Pending';

                    return (
                      <tr key={patient.id}>
                        <td><strong>{patient.patient_name}</strong></td>
                        <td>{patient.mrn}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleOpenAssign(patient)}
                            disabled={!canAssignBed || assigning}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: canAssignBed ? '#2563eb' : '#94a3b8',
                              textDecoration: canAssignBed ? 'underline' : 'none',
                              cursor: canAssignBed ? 'pointer' : 'not-allowed',
                              padding: 0
                            }}
                            title={
                              canAssignBed
                                ? 'Assign bed'
                                : 'Admission must be Pending to assign a bed'
                            }
                          >
                            {bed?.bed_no || 'Assign Bed'}
                          </button>
                        </td>
                        <td>{bed?.Status || 'Unassigned'}</td>
                        <td>
                          <button
                            type="button"
                            className="status-button"
                            onClick={() => handleOpenStatus(patient, admission)}
                            disabled={!admission?.id || statusUpdating}
                            title={admission?.id ? 'Update admission status' : 'No admission record'}
                          >
                            <span className={`status-badge status-${admission?.status || 'unknown'}`}>
                              {admission?.status || 'N/A'}
                            </span>
                          </button>
                        </td>
                        <td>{insurance?.tpa_name || 'N/A'}</td>
                        <td>{insurance?.IGL_status || 'N/A'}</td>
                        <td>{insurance?.Policy_No || 'N/A'}</td>
                        <td>{insurance?.IGL_number || 'N/A'}</td>
                        <td>{formatDate(patient.date_created)}</td>
                        <td className="actions">
                          <button
                            onClick={() => navigate(`/patients/view/${patient.id}`)}
                            className="btn-view"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AssignBedModal
        isOpen={assignModalOpen}
        patient={selectedPatient}
        onClose={() => {
          if (!assigning) {
            setAssignModalOpen(false);
            setSelectedPatient(null);
          }
        }}
        onAssign={handleAssignBed}
      />

      <AdmissionStatusModal
        isOpen={statusModalOpen}
        patient={selectedStatusPatient}
        admission={selectedAdmission}
        onClose={() => {
          if (!statusUpdating) {
            setStatusModalOpen(false);
            setSelectedAdmission(null);
            setSelectedStatusPatient(null);
          }
        }}
        onSave={handleStatusSave}
        loading={statusUpdating}
        error={statusError}
      />

      {assignError && <div className="error-message">{assignError}</div>}
    </div>
  );
}

export default StaffDashboard;