import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { initAuth } from '../../api/auth';
import { getPatient, updateAdmissionRecord, updatePatient, updatePatientInsurance } from '../../api/patients';
import { isAdmin, isDoctor, isStaff } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import PatientForm from '../forms/PatientForm';
import AdmissionForm from '../forms/AdmissionForm';
import InsuranceForm from '../forms/InsuranceForm';
import DetailGrid from './DetailGrid';
import DetailSection from './DetailSection';
import PatientSummaryCard from './PatientSummaryCard';
import './displayPatient.css';

function PatientDisplayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const authenticatedUser = await initAuth();
      if (!authenticatedUser) {
        navigate('/login');
        return;
      }
      setUser(authenticatedUser);
    };

    initialize();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    fetchPatient();
  }, [user, id]);

  const fetchPatient = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPatient(id);
      setPatient(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch patient');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isAdmin()) navigate('/admin-dashboard');
    else if (isDoctor()) navigate('/doctor-dashboard');
    else if (isStaff()) navigate('/staff-dashboard');
    else navigate('/dashboard');
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  };

  const normalizeDateInput = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const getLatestAdmission = (admissions) => {
    if (!admissions) return null;
    if (!Array.isArray(admissions)) return admissions;
    if (admissions.length === 0) return null;
    return admissions
      .filter((item) => item)
      .sort((a, b) => new Date(b.admission_date) - new Date(a.admission_date))[0];
  };

  const getInsurance = (insurance) => {
    if (!insurance) return null;
    if (!Array.isArray(insurance)) return insurance;
    return insurance[0] || null;
  };

  const admission = useMemo(
    () => getLatestAdmission(patient?.patient_Admission),
    [patient]
  );
  const insurance = useMemo(
    () => getInsurance(patient?.insurance),
    [patient]
  );

  const admissionInitialData = useMemo(() => {
    if (!admission) return null;
    return {
      ...admission,
      admission_date: normalizeDateInput(admission.admission_date),
      operation_date: normalizeDateInput(admission.operation_date),
      discharge_date: normalizeDateInput(admission.discharge_date),
      urgent_investigations: Array.isArray(admission.urgent_investigations)
        ? admission.urgent_investigations
        : [],
      endoscopy_procedures: Array.isArray(admission.endoscopy_procedures)
        ? admission.endoscopy_procedures
        : [],
      confirmation_of: Array.isArray(admission.confirmation_of)
        ? admission.confirmation_of
        : []
    };
  }, [admission]);

  const insuranceInitialData = useMemo(() => {
    if (!insurance) return null;
    return {
      ...insurance,
      accident_date: normalizeDateInput(insurance.accident_date),
      illness_symptoms_first_appeared_on_date: normalizeDateInput(
        insurance.illness_symptoms_first_appeared_on_date
      ),
      date_first_consulted: normalizeDateInput(insurance.date_first_consulted),
      date: normalizeDateInput(insurance.date),
      date1: normalizeDateInput(insurance.date1),
      date2: normalizeDateInput(insurance.date2),
      condition_related_to: Array.isArray(insurance.condition_related_to)
        ? insurance.condition_related_to
        : []
    };
  }, [insurance]);

  const patientDetails = useMemo(() => {
    if (!patient) return [];
    return [
      { label: 'Patient Name', value: patient.patient_name },
      { label: 'MRN', value: patient.mrn },
      { label: 'Date of Birth', value: formatDate(patient.date_of_birth) },
      { label: 'NRIC', value: patient.NRIC },
      { label: 'Gender', value: patient.gender },
      { label: 'Contact Number', value: patient.contact_number },
      { label: 'Email', value: patient.email },
      {
        label: 'Created By',
        value: `${patient.user_created?.first_name || ''} ${
          patient.user_created?.last_name || ''
        }`.trim() || 'N/A'
      },
      { label: 'Created On', value: formatDate(patient.date_created) }
    ];
  }, [patient]);

  const admissionDetails = useMemo(() => {
    if (!admission) return [];
    return [
      { label: 'Status', value: admission.status },
      { label: 'Admission Category', value: admission.admission_category },
      { label: 'Admission Date', value: formatDate(admission.admission_date) },
      { label: 'Admission Time', value: admission.admission_time },
      { label: 'Admission To', value: admission.admission_to },
      { label: 'Type of Accommodation', value: admission.type_of_accommodation },
      { label: 'Financial Class', value: admission.financial_class },
      { label: 'Diagnosis', value: admission.diagnosis },
      { label: 'Operation Date', value: formatDate(admission.operation_date) },
      { label: 'Operation Time', value: admission.operation_time },
      {
        label: 'Type of Operation / Procedure',
        value: admission.type_of_operation_or_procedure
      },
      { label: 'Surgery Duration', value: admission.Surgery_Duration },
      {
        label: 'Urgent Investigations',
        value: admission.urgent_investigations
      },
      { label: 'Need to Add Others', value: admission.need_to_add_others },
      { label: 'Other Investigation', value: admission.other_investigation },
      {
        label: 'Instructions to Ward Staff',
        value: admission.instructions_to_ward_staff
      },
      {
        label: 'Endoscopy Procedures',
        value: admission.endoscopy_procedures
      },
      {
        label: 'Sedation and Anesthesia',
        value: admission.Sedation_and_Anesthesia
      },
      {
        label: 'Need to Add More Procedures',
        value: admission.need_to_add_more_procedures
      },
      {
        label: 'Other Endoscopy Procedures',
        value: admission.other_endoscopy_procedures
      },
      {
        label: 'Expected Days of Stay',
        value: admission.expected_days_of_stay
      },
      { label: 'Estimated Cost (RM)', value: admission.estimated_cost_RM },
      {
        label: 'Additional Information and Individual Risks',
        value: admission.Additional_Information_and_Individual_Risks
      },
      { label: 'Confirmation Of', value: admission.confirmation_of },
      { label: 'Discharge Date', value: formatDate(admission.discharge_date) },
      { label: 'Discharge Time', value: admission.discharge_time }
    ];
  }, [admission]);

  const insuranceDetails = useMemo(() => {
    if (!insurance) return [];
    return [
      { label: 'Policy Number', value: insurance.Policy_No },
      { label: 'TPA Name', value: insurance.tpa_name },
      { label: 'IGL Number', value: insurance.IGL_number },
      { label: 'IGL Status', value: insurance.IGL_status },
      { label: 'Estimated Cost', value: insurance.estimated_cost },
      {
        label: 'Expected Days of Stay',
        value: insurance.expected_days_of_stay
      },
      { label: 'Admission Reason', value: insurance.admission_reason },
      { label: 'Accident Date', value: formatDate(insurance.accident_date) },
      { label: 'Accident Time', value: insurance.accident_time },
      { label: 'Accident Details', value: insurance.accident_details },
      {
        label: 'Illness Symptoms First Appeared On',
        value: formatDate(insurance.illness_symptoms_first_appeared_on_date)
      },
      {
        label: 'Doctors Consulted for This Illness',
        value: insurance.doctors_consulted_for_this_illness
      },
      {
        label: 'Doctors or Clinic Contact',
        value: insurance.doctors_or_clinic_contact
      },
      { label: 'Diagnosis', value: insurance.diagnosis },
      {
        label: 'How Long Patient Aware of Condition',
        value: insurance.how_long_is_person_aware_of_this_condition
      },
      { label: 'Blood Pressure', value: insurance.blood_pressure },
      { label: 'Temperature', value: insurance.temperature },
      { label: 'Pulse', value: insurance.pulse },
      { label: 'Date First Consulted', value: formatDate(insurance.date_first_consulted) },
      { label: 'Any Previous Consultation', value: insurance.any_previous_consultaion },
      {
        label: 'Details of Previous Consultation',
        value: insurance.details_of_previous_consultation
      },
      { label: 'Was Patient Referred', value: insurance.was_this_patient_referred },
      { label: 'Patient Referred Details', value: insurance.patient_referred_details },
      { label: 'Condition Exist Before', value: insurance.condition_exist_before },
      { label: 'Date', value: formatDate(insurance.date) },
      { label: 'Disease or Disorder', value: insurance.disease_or_disorder },
      {
        label: 'Treatment or Hospitalization Details',
        value: insurance.treatment_or_hospitalization_details
      },
      { label: 'Doctor / Hospital / Clinic', value: insurance.doctor_or_hospital_or_clinic },
      { label: 'More History', value: insurance.more },
      { label: 'Date (More History A)', value: formatDate(insurance.date1) },
      {
        label: 'Treatment or Hospitalization Details (A)',
        value: insurance.treatment_or_hospitalization_details1
      },
      { label: 'Disease or Disorder (A)', value: insurance.disease_or_disorder1 },
      { label: 'Doctor / Hospital / Clinic (A)', value: insurance.doctor_or_hospital_or_clinic1 },
      { label: 'Date (More History B)', value: formatDate(insurance.date2) },
      {
        label: 'Treatment or Hospitalization Details (B)',
        value: insurance.treatment_or_hospitalization_details2
      },
      { label: 'Disease or Disorder (B)', value: insurance.disease_or_disorder2 },
      { label: 'Doctor / Hospital / Clinic (B)', value: insurance.doctor_or_hospital_or_clinic2 },
      { label: 'Diagnosis Information', value: insurance.diagnosis_information },
      { label: 'Provisional Diagnosis', value: insurance.provisional_diagnosis },
      { label: 'Diagnosis Confirmed', value: insurance.diagnosis_confirmed },
      { label: 'Advised Patient', value: insurance.advised_patient },
      { label: 'Cause and Pathology', value: insurance.cause_and_pathology },
      { label: 'Possibility of Relapse', value: insurance.any_possibility_of_relapse },
      { label: 'Admitting Diagnosis', value: insurance.admitting_diagnosis },
      {
        label: 'Admitting Diagnosis Confirmed',
        value: insurance.admitting_diagnosis_confirmed
      },
      {
        label: 'Admitting Diagnosis Advised Patient',
        value: insurance.admitting_diagnosis_advised_patien
      },
      {
        label: 'Admitting Diagnosis Cause and Pathology',
        value: insurance.admitting_diagnosis_cause_and_pathology
      },
      {
        label: 'Admitting Diagnosis Possibility of Relapse',
        value: insurance.admitting_diagnosisany_possibility_of_relapse
      },
      { label: 'Condition Can Be Managed', value: insurance.condition_be_managed },
      { label: 'Reason for Admission', value: insurance.reason_for_admission },
      { label: 'Condition Related To', value: insurance.condition_related_to },
      { label: 'Need to Add Others', value: insurance.need_to_add_others },
      { label: 'Others', value: insurance.others },
      { label: 'Type of Operation Procedures', value: insurance.type_of_operation_procedures },
      { label: 'Need to Add Others Copy', value: insurance.need_to_add_others_copy },
      { label: 'Condition 1', value: insurance.Condition_1 },
      { label: 'Condition 2', value: insurance.Condition_2 },
      { label: 'Since', value: insurance.since },
      { label: 'Since Copy', value: insurance.since_copy },
      { label: 'Pregnant Information', value: insurance.pregnant_information },
      { label: 'Pregnancy Duration', value: insurance.pregnancy_duration }
    ];
  }, [insurance]);

  const staffDetails = useMemo(() => {
    if (!patient) return [];
    return [
      { label: 'Patient Name', value: patient.patient_name },
      { label: 'MRN', value: patient.mrn },
      { label: 'Insurance Company', value: insurance?.tpa_name || 'N/A' },
      { label: 'IGL Status', value: insurance?.IGL_status || 'N/A' },
      { label: 'Policy Number', value: insurance?.Policy_No || 'N/A' },
      { label: 'IGL Number', value: insurance?.IGL_number || 'N/A' },
      { label: 'Date Created', value: formatDate(patient.date_created) }
    ];
  }, [patient, insurance]);

  const handlePatientSubmit = async (formData) => {
    setSavingSection('patient');
    setError('');
    try {
      await updatePatient(id, formData);
      setEditingSection(null);
      fetchPatient();
    } catch (err) {
      setError(err.message || 'Failed to update patient');
    } finally {
      setSavingSection(null);
    }
  };

  const handleAdmissionSubmit = async (formData) => {
    if (!admission?.id) return;
    setSavingSection('admission');
    setError('');
    try {
      const { Patient, ...payload } = formData;
      await updateAdmissionRecord(admission.id, payload);
      setEditingSection(null);
      fetchPatient();
    } catch (err) {
      setError(err.message || 'Failed to update admission');
    } finally {
      setSavingSection(null);
    }
  };

  const handleInsuranceSubmit = async (formData) => {
    if (!insurance?.id) return;
    setSavingSection('insurance');
    setError('');
    try {
      const { pation, ...payload } = formData;
      await updatePatientInsurance(insurance.id, payload);
      setEditingSection(null);
      fetchPatient();
    } catch (err) {
      setError(err.message || 'Failed to update insurance');
    } finally {
      setSavingSection(null);
    }
  };

  if (!user || loading) return <div className="loading">Loading patient details...</div>;
  if (!patient) return <div className="error-message">Patient not found</div>;

  const isStaffView = isStaff();

  return (
    <div className="display-page">
      <Navbar user={user} />

      <div className="display-container">
        <div className="display-header">
          <button onClick={handleBack} className="btn-secondary">
            ← Back
          </button>
          <div>
            <h1 className="page-title">Patient Profile</h1>
            <p className="page-subtitle">Comprehensive patient overview and editable sections</p>
          </div>
          <div className="header-spacer" />
        </div>

        {error && <div className="error-message">{error}</div>}

        <PatientSummaryCard patient={patient} admission={admission} insurance={insurance} />

        {isStaffView ? (
          <DetailSection
            title="Patient Summary"
            subtitle="Staff view"
            isEditing={false}
            onEdit={() => {}}
            showEdit={false}
          >
            <DetailGrid items={staffDetails} />
          </DetailSection>
        ) : (
          <>
            <DetailSection
              title="Patient Details"
              subtitle="Full patient information"
              isEditing={editingSection === 'patient'}
              onEdit={() => setEditingSection(editingSection === 'patient' ? null : 'patient')}
              showEdit
            >
              {editingSection === 'patient' ? (
                <PatientForm
                  initialData={patient}
                  onSubmit={handlePatientSubmit}
                  onCancel={() => setEditingSection(null)}
                  loading={savingSection === 'patient'}
                  submitLabel="Save Patient"
                  loadingLabel="Saving..."
                  cancelLabel="Cancel"
                />
              ) : (
                <DetailGrid items={patientDetails} />
              )}
            </DetailSection>

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
                    initialData={admissionInitialData}
                    onSubmit={handleAdmissionSubmit}
                    onCancel={() => setEditingSection(null)}
                    loading={savingSection === 'admission'}
                    submitLabel="Save Admission"
                    loadingLabel="Saving..."
                    cancelLabel="Cancel"
                  />
                ) : (
                  <DetailGrid items={admissionDetails} />
                )
              ) : (
                <p className="empty-state">No admission details available.</p>
              )}
            </DetailSection>

            <DetailSection
              title="Insurance Details"
              subtitle="Full insurance record"
              isEditing={editingSection === 'insurance'}
              onEdit={() => setEditingSection(editingSection === 'insurance' ? null : 'insurance')}
              showEdit={Boolean(insurance)}
            >
              {insurance ? (
                editingSection === 'insurance' ? (
                  <InsuranceForm
                    patientId={patient.id}
                    initialData={insuranceInitialData}
                    onSubmit={handleInsuranceSubmit}
                    onCancel={() => setEditingSection(null)}
                    loading={savingSection === 'insurance'}
                    submitLabel="Save Insurance"
                    loadingLabel="Saving..."
                    cancelLabel="Cancel"
                  />
                ) : (
                  <DetailGrid items={insuranceDetails} />
                )
              ) : (
                <p className="empty-state">No insurance details available.</p>
              )}
            </DetailSection>
          </>
        )}
      </div>
    </div>
  );
}

export default PatientDisplayPage;
