// src/pages/CreatePatientPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initAuth } from '../../api/auth';
import { createPatient } from '../../api/patients';
import Navbar from '../../components/Navbar';
import directus from '../../api/directus';
import { createItem } from '@directus/sdk';
import PatientForm from './PatientForm';
import AdmissionForm from './AdmissionForm';
import InsuranceForm from './InsuranceForm';

function CreatePatientPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(1); // 1: Patient, 2: Admission, 3: Insurance
  
  // Store created data for next steps
  const [createdPatient, setCreatedPatient] = useState(null);
  const [needsInsurance, setNeedsInsurance] = useState(false);

  const handleBack = () => {
    const roleName = user?.role?.name;
    if (roleName === 'Doctor') {
      navigate('/doctor-dashboard');
    } else if (roleName === 'Administrator') {
      navigate('/admin-dashboard');
    } else if (roleName === 'Hospital Staff' || roleName === 'Hospital_staff') {
      navigate('/staff-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const authenticatedUser = await initAuth();
      
      if (!authenticatedUser) {
        navigate('/login');
        return;
      }
      
      const allowedRoles = ['Doctor', 'Administrator'];
      if (!allowedRoles.includes(authenticatedUser.role?.name)) {
        alert('Only doctors and administrators can create patients');
        navigate('/dashboard');
        return;
      }
      
      setUser(authenticatedUser);
    };

    initialize();
  }, [navigate]);

  // Handle patient form submission
  const handlePatientSubmit = async (patientData) => {
    setLoading(true);
    setError('');

    try {
      const patient = await createPatient(patientData);
      console.log('Patient created:', patient);
      
      setCreatedPatient(patient);
      setActiveStep(2); // Move to admission form
    } catch (err) {
      console.error('Error creating patient:', err);
      setError(err.message || 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  // Handle admission form submission
  const handleAdmissionSubmit = async (admissionData) => {
    setLoading(true);
    setError('');

    try {
      console.log('Creating admission with data:', admissionData);
      
      // Create admission - the relationship is already included in admissionData
      const admission = await directus.request(
        createItem('Admission', {
          ...admissionData  // Already contains Patient: [{ id: patientId }]
        })
      );
      console.log('Admission created:', admission);

      // Check if insurance form is needed
      if (admissionData.financial_class === 'Guarantee Letter') {
        setNeedsInsurance(true);
        setActiveStep(3);
      } else {
        alert('Patient and admission created successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error creating admission:', err);
      setError(err.message || 'Failed to create admission...');
    } finally {
      setLoading(false);
    }
  };

  // Handle insurance form submission
  const handleInsuranceSubmit = async (insuranceData) => {
    setLoading(true);
    setError('');

    try {
      console.log('Creating insurance with data:', insuranceData);
      
      // IMPORTANT: The field name is 'pation' (not 'Patient') based on the Directus schema
      // insuranceData already contains 'pation: patientId' from InsuranceForm
      const insurance = await directus.request(
        createItem('insurance', insuranceData)
      );
      console.log('Insurance created:', insurance);

      alert('Patient, admission, and insurance created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating insurance:', err);
      setError(err.message || 'Failed to create insurance. Patient and admission were created successfully, you can add insurance details later from the patient page.');
      // Even if insurance fails, patient and admission are already created
      setTimeout(() => navigate('/dashboard'), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle skip insurance
  const handleSkipInsurance = () => {
    alert('Patient and admission created successfully!');
    navigate('/dashboard');
  };

  // Handle cancel
  const handleCancel = () => {
    if (createdPatient) {
      const confirmCancel = window.confirm(
        'Patient has already been created. Are you sure you want to cancel? You can complete the remaining details from the patient page.'
      );
      if (confirmCancel) {
        navigate('/dashboard');
      }
    } else {
      const confirmCancel = window.confirm('Are you sure you want to cancel? All entered data will be lost.');
      if (confirmCancel) {
        navigate('/dashboard');
      }
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#2c3e50'
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '30px',
      gap: '10px'
    },
    step: {
      flex: 1,
      padding: '15px',
      textAlign: 'center',
      borderRadius: '8px',
      backgroundColor: '#e8eef5',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      border: '2px solid #cbd5e0'
    },
    stepActive: {
      backgroundColor: '#3498db',
      color: 'white',
      border: '2px solid #2980b9'
    },
    stepCompleted: {
      backgroundColor: '#27ae60',
      color: 'white',
      border: '2px solid #229954'
    },
    errorBox: {
      backgroundColor: '#fadbd8',
      color: '#c0392b',
      padding: '15px',
      borderRadius: '4px',
      marginBottom: '20px'
    }
  };

  return (
    <div>
      <Navbar user={user} />
      
      <div style={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={handleBack}
            className="btn-secondary"
          >
            ← Back
          </button>
          <h1 style={{ ...styles.header, margin: 0 }}>Create New Patient</h1>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          <div style={{
            ...styles.step,
            ...(activeStep === 1 ? styles.stepActive : {}),
            ...(activeStep > 1 ? styles.stepCompleted : {})
          }}>
            Step 1: Patient Info
          </div>
          <div style={{
            ...styles.step,
            ...(activeStep === 2 ? styles.stepActive : {}),
            ...(activeStep > 2 ? styles.stepCompleted : {})
          }}>
            Step 2: Admission (Required)
          </div>
          {needsInsurance && (
            <div style={{
              ...styles.step,
              ...(activeStep === 3 ? styles.stepActive : {})
            }}>
              Step 3: Insurance (Optional)
            </div>
          )}
        </div>

        {/* Render appropriate form based on active step */}
        {activeStep === 1 && (
          <PatientForm
            onSubmit={handlePatientSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        )}

        {activeStep === 2 && createdPatient && (
          <AdmissionForm
            patientId={createdPatient.id}
            onSubmit={handleAdmissionSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        )}

        {activeStep === 3 && createdPatient && needsInsurance && (
          <InsuranceForm
            patientId={createdPatient.id}
            onSubmit={handleInsuranceSubmit}
            onSkip={handleSkipInsurance}
            onCancel={handleCancel}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

export default CreatePatientPage;