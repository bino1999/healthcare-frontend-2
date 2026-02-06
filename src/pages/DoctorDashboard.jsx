// src/pages/AdminDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { initAuth } from '../api/auth';
import { getPatients } from '../api/patients';
import Navbar from '../components/Navbar';
import IglStatusPieChart from './charts/IglStatusPieChart';
import AdmissionStatusPieChart from './charts/AdmissionStatusPieChart';
import FiltersBar from './dashboard-widgets/FiltersBar';
import KpiCards from './dashboard-widgets/KpiCards';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [operationDateFilter, setOperationDateFilter] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const authenticatedUser = await initAuth();
      
      if (!authenticatedUser) {
        navigate('/login');
        return;
      }
      
      if (authenticatedUser.role?.name !== 'Doctor') {
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
      // Unified search - patient name, MRN, insurance company, bed no
      if (normalizedSearch) {
        const insurance = getInsurance(patient.insurance);
        const bed = getBed(patient.patient_bed);
        const searchTarget = [
          patient.patient_name || '',
          patient.mrn || '',
          insurance?.tpa_name || '',
          insurance?.tpa_company || '',
          bed?.bed_no || ''
        ].join(' ').toLowerCase();
        if (!searchTarget.includes(normalizedSearch)) return false;
      }

      // Operation date filter
      if (operationDateFilter) {
        const admission = getLatestAdmission(patient.patient_Admission);
        if (!admission?.operation_date) return false;
        const opDate = admission.operation_date.split('T')[0];
        if (opDate !== operationDateFilter) return false;
      }

      return true;
    });
  }, [patients, normalizedSearch, operationDateFilter]);

  const iglChartData = useMemo(() => {
    const counts = { 
      Pending: 0, 
      Approved: 0, 
      Rejected: 0, 
      'Partial Approval': 0, 
      'Under Review': 0, 
      Cancelled: 0 
    };
    filteredPatients.forEach((patient) => {
      const insurance = getInsurance(patient.insurance);
      const status = (insurance?.IGL_status || '').toLowerCase();
      if (status.includes('reject')) counts.Rejected += 1;
      else if (status.includes('partial')) counts['Partial Approval'] += 1;
      else if (status.includes('review')) counts['Under Review'] += 1;
      else if (status.includes('cancel')) counts.Cancelled += 1;
      else if (status.includes('approve')) counts.Approved += 1;
      else counts.Pending += 1;
    });
    return [
      { name: 'Pending', value: counts.Pending },
      { name: 'Approved', value: counts.Approved },
      { name: 'Rejected', value: counts.Rejected },
      { name: 'Partial Approval', value: counts['Partial Approval'] },
      { name: 'Under Review', value: counts['Under Review'] },
      { name: 'Cancelled', value: counts.Cancelled }
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
          <h1>Doctor Dashboard</h1>
          <button 
            onClick={() => navigate('/patients/create')} 
            className="btn-primary"
          >
            + Create New Patient
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <KpiCards items={kpiData} />

        <div className="dashboard-charts">
          <IglStatusPieChart data={iglChartData} />
          <AdmissionStatusPieChart data={admissionChartData} />
        </div>

        <FiltersBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          operationDateFilter={operationDateFilter}
          onOperationDateChange={setOperationDateFilter}
        />

        {loading ? (
          <div className="loading">Loading patients...</div>
        ) : (
          <div className="table-container dashboard-table-container">
            <table className="data-table dashboard-table">
              <thead>
                <tr>
                  <th>MRN</th>
                  <th className="sticky-col">Patient Name</th>
                  <th>Bed No</th>
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
                    <td colSpan="11" className="text-center">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const admission = getLatestAdmission(patient.patient_Admission);
                    const insurance = getInsurance(patient.insurance);
                    const bed = getBed(patient.patient_bed);

                    return (
                      <tr key={patient.id}>
                        <td>{patient.mrn}</td>
                        <td className="sticky-col">
                          <span className="truncate" title={patient.patient_name}>
                            <strong>{patient.patient_name}</strong>
                          </span>
                        </td>
                        <td>{bed?.bed_no || 'N/A'}</td>
                        <td>
                          <span className={`status-badge status-${admission?.status || 'unknown'}`}>
                            {admission?.status || 'N/A'}
                          </span>
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
    </div>
  );
}

export default DoctorDashboard;