// src/pages/AdminDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { initAuth } from '../api/auth';
import { assignBedToPatient, getPatients, deletePatient, updateAdmissionRecord } from '../api/patients';
import Navbar from '../components/Navbar';
import AssignBedModal from './bedcollection/AssignBedModal';
import AdmissionStatusModal from '../components/AdmissionStatusModal';
import IglStatusPieChart from './charts/IglStatusPieChart';
import AdmissionStatusPieChart from './charts/AdmissionStatusPieChart';
import FiltersBar from './dashboard-widgets/FiltersBar';
import KpiCards from './dashboard-widgets/KpiCards';

function AdminDashboard() {
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
      const authenticatedUser = await initAuth();
      
      if (!authenticatedUser) {
        navigate('/login');
        return;
      }
      
      if (authenticatedUser.role?.name !== 'Administrator') {
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

  const handleDelete = async (id, patientName) => {
    if (!window.confirm(`Are you sure you want to delete ${patientName}?`)) {
      return;
    }

    try {
      await deletePatient(id);
      alert('Patient deleted successfully!');
      fetchPatients();
    } catch (err) {
      alert(err.message);
    }
  };

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


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  // Helper function to get the latest admission
  const getLatestAdmission = (admissions) => {
    if (!admissions || admissions.length === 0) return null;
    
    // If single admission object (Many-to-One)
    if (!Array.isArray(admissions)) return admissions;
    
    // If array of admissions (One-to-Many), get the latest
    return admissions.sort((a, b) => 
      new Date(b.admission_date) - new Date(a.admission_date)
    )[0];
  };

  // Helper function to get insurance data
  const getInsurance = (insurance) => {
    if (!insurance) return null;
    
    // If single insurance object
    if (!Array.isArray(insurance)) return insurance;
    
    // If array, get the first or active one
    return insurance[0] || null;
  };

  // Helper function to get bed data
  const getBed = (bed) => {
    if (!bed) return null;
    
    // If single bed object
    if (!Array.isArray(bed)) return bed;
    
    // If array, get the current/active bed
    return bed[0] || null;
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

  if (!user || initializing) return <div className="loading">Loading...</div>;

  return (
    <div>
      <Navbar user={user} />
      
      <div className="page-container">
        <div className="page-header">
          <h1>Administrator Dashboard</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => navigate('/patients/create')} 
              className="btn-primary"
            >
              + Create New Patient
            </button>
            <button
              onClick={() => navigate('/ward-management')}
              className="btn-secondary"
            >
              Ward & Bed Management
            </button>
          </div>
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
                  <th>MRN</th>
                  <th>Patient Name</th>
                  <th>Bed No</th>
                  <th>Bed Status</th>
                  <th>Status</th>
                  <th>Insurance Company</th>
                  <th>IGL Status</th>
                  <th>Admission Date</th>
                  <th>Operation Date</th>
                  <th>Operation Time</th>
                  <th>Admitted By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const admission = getLatestAdmission(patient.patient_Admission);
                    const insurance = getInsurance(patient.insurance);
                    const bed = getBed(patient.patient_bed);
                    const canAssignBed = admission?.status === 'Admission Pending';

                    return (
                      <tr key={patient.id}>
                        <td>{patient.mrn}</td>
                        <td><strong>{patient.patient_name}</strong></td>
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
                        <td>
                          <span className={`igl-status ${insurance?.IGL_status || ''}`}>
                            {insurance?.IGL_status || 'N/A'}
                          </span>
                        </td>
                        <td>{formatDate(admission?.admission_date)}</td>
                        <td>{formatDate(admission?.operation_date)}</td>
                        <td>{formatTime(admission?.operation_time)}</td>
                        <td>
                          {patient.user_created?.first_name} {patient.user_created?.last_name}
                        </td>
                        <td className="actions">
                          <button 
                            onClick={() => navigate(`/patients/view/${patient.id}`)}
                            className="btn-view"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleDelete(patient.id, patient.patient_name)}
                            className="btn-delete"
                          >
                            Delete
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

export default AdminDashboard;