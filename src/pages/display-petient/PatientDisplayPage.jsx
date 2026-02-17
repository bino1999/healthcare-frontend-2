import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { initAuth } from '../../api/auth';
import { updateAdmissionRecord, updatePatient, updatePatientInsurance } from '../../api/patients';
import { createReferralLetter } from '../../api/Referralletter';
import { createAddOnProcedure } from '../../api/addOnProcedures';
import { isAdmin, isDoctor, isStaff } from '../../utils/auth';
import directus from '../../api/directus';
import { createItem } from '@directus/sdk';
import Navbar from '../../components/Navbar';
import usePatient from '../../hooks/usePatient';
import useReferralLetters from '../../hooks/useReferralLetters';
import useAddOnProcedures from '../../hooks/useAddOnProcedures';
import HeaderActions from './panels/HeaderActions';
import OverviewPanel from './panels/OverviewPanel';
import AdmissionPanel from './panels/AdmissionPanel';
import InsurancePanel from './panels/InsurancePanel';
import ReferralsPanel from './panels/ReferralsPanel';
import AddOnsPanel from './panels/AddOnsPanel';
import PatientHeader from './PatientHeader';
import SectionTabs from './SectionTabs';
import SectionSearch from './SectionSearch';
import PatientLoading from './PatientLoading';
import DetailGrid from './DetailGrid';
import DetailSection from './DetailSection';
import PatientSummaryCard from './PatientSummaryCard';
import { calculateTotalFee } from '../../utils/costs';
import { analyzeClaimRisk } from '../../ai-analysis/analyzeClaimRisk';
import AiAnalysisModal from '../../ai-analysis/AiAnalysisModal';
import GeneratePafModal from '../GeneratePAF/GeneratePafModal';
import './displayPatient.css';

function PatientDisplayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [savingSection, setSavingSection] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [showCreateAdmission, setShowCreateAdmission] = useState(false);
  const [showCreateInsurance, setShowCreateInsurance] = useState(false);
  const [showAllAdmissionFields, setShowAllAdmissionFields] = useState(false);
  const [showAllInsuranceFields, setShowAllInsuranceFields] = useState(false);
  const [showCreateReferral, setShowCreateReferral] = useState(false);
  const [showCreateAddOn, setShowCreateAddOn] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState('');
  const [aiAnalysisData, setAiAnalysisData] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPafModal, setShowPafModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [patientSearch, setPatientSearch] = useState('');
  const [admissionSearch, setAdmissionSearch] = useState('');
  const [insuranceSearch, setInsuranceSearch] = useState('');
  const [showAdvancedAdmission, setShowAdvancedAdmission] = useState(false);
  const [showAdvancedInsurance, setShowAdvancedInsurance] = useState(false);
  const {
    patient,
    loading,
    error: patientError,
    refresh: refreshPatient
  } = usePatient(id, Boolean(user));
  const {
    letters: referralLetters,
    loading: referralLoading,
    error: referralError,
    refresh: refreshReferralLetters,
    setError: setReferralError
  } = useReferralLetters(id, Boolean(user));
  const {
    procedures: addOnProcedures,
    loading: addOnLoading,
    error: addOnError,
    refresh: refreshAddOnProcedures,
    setError: setAddOnError
  } = useAddOnProcedures(id, Boolean(user));

  // Local page error state (separate from hook-provided errors)
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

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    const amount = Number(value);
    if (!Number.isFinite(amount)) return 'N/A';
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount);
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

  const requiresInsurance = admission?.financial_class === 'Guarantee Letter';

  useEffect(() => {
    setShowCreateAdmission(!admission);
  }, [admission]);

  useEffect(() => {
    setShowCreateInsurance(!insurance && requiresInsurance);
  }, [insurance, requiresInsurance]);

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



  const admissionSections = useMemo(() => {
    if (!admission) return [];
    return [
      {
        title: 'Admission Basics',
        items: [
          { label: 'Status', value: admission.status },
          { label: 'Admission Category', value: admission.admission_category },
          { label: 'Admission Date', value: formatDate(admission.admission_date) },
          { label: 'Admission Time', value: admission.admission_time },
          { label: 'Admission To', value: admission.admission_to },
          { label: 'Type of Accommodation', value: admission.type_of_accommodation },
          { label: 'Financial Class', value: admission.financial_class },
          { label: 'Diagnosis', value: admission.diagnosis }
        ]
      },
      {
        title: 'Operation Details',
        items: [
          { label: 'Operation Date', value: formatDate(admission.operation_date) },
          { label: 'Operation Time', value: admission.operation_time },
          { label: 'Type of Operation / Procedure', value: admission.type_of_operation_or_procedure },
          { label: 'Surgery Duration', value: admission.Surgery_Duration }
        ]
      },
      {
        title: 'Investigations & Procedures',
        advanced: true,
        items: [
          { label: 'Urgent Investigations', value: admission.urgent_investigations },
          { label: 'Other Investigation', value: admission.other_investigation },
          { label: 'Endoscopy Procedures', value: admission.endoscopy_procedures },
          { label: 'Sedation / Anesthesia', value: admission.Sedation_and_Anesthesia },
          { label: 'Other Endoscopy Procedures', value: admission.other_endoscopy_procedures }
        ]
      },
      {
        title: 'Care Instructions',
        advanced: true,
        items: [
          { label: 'Instructions to Ward Staff', value: admission.instructions_to_ward_staff },
          { label: 'Additional Notes / Risks', value: admission.Additional_Information_and_Individual_Risks },
          { label: 'Confirmation Of', value: admission.confirmation_of }
        ]
      },
      {
        title: 'Cost & Stay',
        items: [
          { label: 'Expected Days of Stay', value: admission.expected_days_of_stay },
          { label: 'Estimated Cost (RM)', value: admission.estimated_cost_RM }
        ]
      },
      {
        title: 'Discharge',
        advanced: true,
        items: [
          { label: 'Discharge Date', value: formatDate(admission.discharge_date) },
          { label: 'Discharge Time', value: admission.discharge_time }
        ]
      }
    ];
  }, [admission]);

  const insuranceSections = useMemo(() => {
    if (!insurance) return [];

    return [
      // Patient information
      {
        title: 'Patient Information',
        items: [
          { label: 'Policy No', value: insurance.Policy_No },
          { label: 'Insurance Company', value: insurance.tpa_name },
          { label: 'IGL Number', value: insurance.IGL_number },
          { label: 'IGL Status', value: insurance.IGL_status },
          { label: 'Estimated Cost', value: insurance.estimated_cost },
          { label: 'Expected Days of Stay', value: insurance.expected_days_of_stay }
        ]
      },

      // Admission information
      {
        title: 'Admission Information',
        items: [
          { label: 'Admission Reason', value: insurance.admission_reason },
          { label: 'Illness Symptoms First Appeared On', value: formatDate(insurance.illness_symptoms_first_appeared_on_date) },
          { label: 'Doctor(s) Consulted', value: insurance.doctors_consulted_for_this_illness },
          { label: "Doctor's / Clinic Contact (Address & Telephone)", value: insurance.doctors_or_clinic_contact }
        ]
      },

      // Medical assessment
      {
        title: 'Medical Assessment',
        items: [
          { label: 'Diagnosis', value: insurance.diagnosis },
          { label: 'How Long Is Person Aware', value: insurance.how_long_is_person_aware_of_this_condition },
          { label: 'Blood Pressure', value: insurance.blood_pressure },
          { label: 'Temperature', value: insurance.temperature },
          { label: 'Pulse', value: insurance.pulse },
          { label: 'Date First Consulted', value: formatDate(insurance.date_first_consulted) }
        ]
      },

      // Previous consultation (radio + details)
      {
        title: 'Previous Consultation',
        items: [
          { label: 'Any Previous Consultation ', value: insurance.any_previous_consultaion },
          { label: 'Previous Consultation Details', value: insurance.details_of_previous_consultation }
        ]
      },

      // Referral and condition history
      {
        title: 'Referral & Condition History',
        items: [
          { label: 'Was Patient Referred ', value: insurance.was_this_patient_referred },
          { label: 'Patient Referred Details', value: insurance.patient_referred_details },
          { label: 'Condition Exist Before ', value: insurance.condition_exist_before }
        ]
      },

      // Previous treatment history (primary)
      {
        title: 'Previous Treatment History',
        advanced: true,
        items: [
          { label: 'Previous Treatment - Date', value: formatDate(insurance.date) },
          { label: 'Treatment / Hospitalization Details', value: insurance.treatment_or_hospitalization_details },
          { label: 'Disease / Disorder', value: insurance.disease_or_disorder },
          { label: 'Doctor / Hospital / Clinic', value: insurance.doctor_or_hospital_or_clinic },
          { label: 'More (flag)', value: insurance.more }
        ]
      },

      // Additional previous history entries
      {
        title: 'Previous Treatment History (a)',
        advanced: true,
        items: [
          { label: 'Date (a)', value: formatDate(insurance.date1) },
          { label: 'Treatment / Hospital / Clinic (a)', value: insurance.treatment_or_hospitalization_details1 },
          { label: 'Disease / Disorder (a)', value: insurance.disease_or_disorder1 },
          { label: 'Doctor / Hospital / Clinic (a)', value: insurance.doctor_or_hospital_or_clinic1 }
        ]
      },

      {
        title: 'Previous Treatment History (b)',
        advanced: true,
        items: [
          { label: 'Date (b)', value: formatDate(insurance.date2) },
          { label: 'Treatment / Hospital / Clinic (b)', value: insurance.treatment_or_hospitalization_details2 },
          { label: 'Disease / Disorder (b)', value: insurance.disease_or_disorder2 },
          { label: 'Doctor / Hospital / Clinic (b)', value: insurance.doctor_or_hospital_or_clinic2 }
        ]
      },

      // Diagnosis information: provisional
      {
        title: 'Diagnosis Information (Provisional)',
        advanced: true,
        items: [
          { label: 'Provisional Diagnosis', value: insurance.provisional_diagnosis },
          { label: 'Diagnosis Confirmed', value: insurance.diagnosis_confirmed },
          { label: 'Advised to Patient', value: insurance.advised_patient },
          { label: 'Cause & Pathology', value: insurance.cause_and_pathology },
          { label: 'Any Possibility Of Relapse ', value: insurance.any_possibility_of_relapse }
        ]
      },

      // Diagnosis information: admitting
      {
        title: 'Admitting Diagnosis',
        advanced: true,
        items: [
          { label: 'Admitting Diagnosis', value: insurance.admitting_diagnosis },
          { label: 'Admitting Diagnosis Confirmed', value: insurance.admitting_diagnosis_confirmed },
          { label: 'Admitting Diagnosis - Advised Patient', value: insurance.admitting_diagnosis_advised_patien },
          { label: 'Admitting Diagnosis Cause & Pathology', value: insurance.admitting_diagnosis_cause_and_pathology },
          { label: 'Admitting Diagnosis - Any Possibility Of Relapse ', value: insurance.admitting_diagnosisany_possibility_of_relapse }
        ]
      },

      // Condition & other details (checkbox group + 'other' flow)
      {
        title: 'Condition & Other Details',
        items: [
          { label: 'Condition Related To (checkboxes)', value: insurance.condition_related_to },
          { label: 'Are there any other conditions to add? ', value: insurance.need_to_add_others },
          { label: 'Other condition details (shown when Yes)', value: insurance.need_to_add_others_copy },
          { label: 'Type Of Operation / Procedures', value: insurance.type_of_operation_procedures },
          { label: 'Other Notes', value: insurance.others }
        ]
      },

      // Other medical/surgical conditions with clarified 'since' labels
      {
        title: 'Other Medical / Surgical Conditions',
        items: [
          { label: 'Any other medical/surgical conditions present? ', value: insurance.need_to_add_others },
          { label: 'Condition 1', value: insurance.Condition_1 },
          { label: 'Since (Condition 1)', value: insurance.since },
          { label: 'Condition 2', value: insurance.Condition_2 },
          { label: 'Since (Condition 2)', value: insurance.since_copy }
        ]
      },

      // Pregnancy
      {
        title: 'Pregnancy',
        advanced: true,
        items: [
          { label: 'Was the patient pregnant at the time of hospitalization? (For Female Only)', value: insurance.pregnant_information },
          { label: 'Pregnancy Duration', value: insurance.pregnancy_duration }
        ]
      }
    ];
  }, [insurance]);





  const syncTotalFee = async (admissionData) => {
    if (!admissionData) return;
    const total_fee = calculateTotalFee(admissionData);
    try {
      await updatePatient(id, { total_fee });
    } catch (err) {
      console.error('Update total fee error:', err);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!patient) return;
    setShowAiModal(true);
    setAiAnalysisLoading(true);
    setAiAnalysisError('');
    setAiAnalysisData(null);

    console.log('Starting Predictive Claims ...');
    console.log('Endpoint:', import.meta.env.VITE_AI_ANALYSIS_URL);

    try {
      const { formatted, raw } = await analyzeClaimRisk({
        patient,
        admission,
        insurance,
        procedures: addOnProcedures
      });

      console.log('Predictive Claims  completed:', { formatted, raw });

      if (!formatted && !raw) {
        throw new Error('Predictive Claims  returned an empty response.');
      }

      setAiAnalysisData(raw);
    } catch (err) {
      console.error('Predictive Claims  error:', err);
      setAiAnalysisError(err.message || 'Failed to run Predictive Claims .');
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const handlePatientSubmit = async (formData) => {
    setSavingSection('patient');
    setError('');
    try {
      await updatePatient(id, formData);
      setEditingSection(null);
      refreshPatient();
    } catch (err) {
      // error handled by hook
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
      await syncTotalFee(payload);
      setEditingSection(null);
      refreshPatient();
    } catch (err) {
      // error handled by hook
    } finally {
      setSavingSection(null);
    }
  };

  const handleInsuranceSubmit = async (formData) => {
    const insuranceId = insurance?.id || formData?.id;
    console.log('handleInsuranceSubmit called', { formData, insuranceId });
    if (!insuranceId) {
      console.warn('No insuranceId found; aborting update', { insurance, formData });
      setError('No insurance record found to update.');
      return;
    }
    setSavingSection('insurance');
    setError(''); // Clear any previous errors
    try {
      const { pation, ...payload } = formData;
      console.log('Updating insurance', { insuranceId, payload });
      await updatePatientInsurance(insuranceId, payload);
      console.log('Insurance update successful', { insuranceId });
      setEditingSection(null);
      await refreshPatient();
    } catch (err) {
      console.error('Insurance update failed', err);
      setError(err.message || 'Failed to update insurance.'); // Set error message on failure
    } finally {
      setSavingSection(null);
    }
  };

  const handleCreateAdmission = async (formData) => {
    setSavingSection('create-admission');
    setError('');
    try {
      await directus.request(createItem('Admission', formData));
      await syncTotalFee(formData);
      setShowCreateAdmission(false);
      await refreshPatient();
    } catch (err) {
      // error handled by hook
    } finally {
      setSavingSection(null);
    }
  };

  const handleCreateInsurance = async (formData) => {
    setSavingSection('create-insurance');
    setError('');
    try {
      await directus.request(createItem('insurance', formData));
      setShowCreateInsurance(false);
      await refreshPatient();
    } catch (err) {
      // error handled by hook
    } finally {
      setSavingSection(null);
    }
  };

  const handleCreateReferral = async (formData) => {
    setSavingSection('create-referral');
    setReferralError('');
    try {
      await createReferralLetter(formData);
      setShowCreateReferral(false);
      await refreshReferralLetters();
    } catch (err) {
      setReferralError(err.message || 'Failed to create referral letter');
    } finally {
      setSavingSection(null);
    }
  };

  const handleCreateAddOnProcedure = async (formData) => {
    setSavingSection('create-add-on');
    setAddOnError('');
    try {
      await createAddOnProcedure(formData);
      setShowCreateAddOn(false);
      await refreshAddOnProcedures();
    } catch (err) {
      setAddOnError(err.message || 'Failed to create add-on procedure');
    } finally {
      setSavingSection(null);
    }
  };

  if (!user || loading) return <PatientLoading />;
  if (!patient) return <div className="error-message">Patient not found</div>;

  const isStaffView = isStaff();
  const canManageClinical = isAdmin() || isDoctor();
  const summaryChips = [
    { label: 'MRN', value: patient.mrn || 'N/A' },
    { label: 'Admission', value: admission?.status || 'N/A' },
    { label: 'IGL', value: insurance?.IGL_status || 'N/A' },
    { label: 'Total Fee', value: formatCurrency(patient.total_fee) },
    {
      label: 'Updated',
      value: formatDate(patient.date_updated || patient.date_created)
    }
  ];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'admission', label: 'Admission', hidden: false },
    { key: 'insurance', label: 'Insurance', hidden: !admission },
    { key: 'add-ons', label: 'Add-on Procedures' },
    { key: 'referrals', label: 'Referrals' }
  ].filter((tab) => !tab.hidden);

  return (
    <div className="display-page">
      <Navbar user={user} />

      <div className="display-container">
        <PatientHeader
          title="Patient Profile"
          onBack={handleBack}
          chips={summaryChips}
          actions={
            <HeaderActions
              canManageClinical={canManageClinical}
              admission={admission}
              insurance={insurance}
              setActiveTab={setActiveTab}
              setShowCreateAdmission={setShowCreateAdmission}
              setShowCreateReferral={setShowCreateReferral}
              setShowCreateAddOn={setShowCreateAddOn}
              setShowPafModal={setShowPafModal}
              handleRunAiAnalysis={handleRunAiAnalysis}
              aiAnalysisLoading={aiAnalysisLoading}
            />
          }
        />

        {(error || patientError) && <div className="error-message">{error || patientError}</div>}

        <PatientSummaryCard patient={patient} admission={admission} insurance={insurance} />

        <SectionTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'overview' && (
          <OverviewPanel
            isStaffView={isStaffView}
            patient={patient}
            admission={admission}
            insurance={insurance}
            patientSearch={patientSearch}
            setPatientSearch={setPatientSearch}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            savingSection={savingSection}
            handlePatientSubmit={handlePatientSubmit}
          />
        )}

        {activeTab === 'admission' && (
          <AdmissionPanel
            admission={admission}
            patient={patient}
            canManageClinical={canManageClinical}
            showAllAdmissionFields={showAllAdmissionFields}
            setShowAllAdmissionFields={setShowAllAdmissionFields}
            showAdvancedAdmission={showAdvancedAdmission}
            setShowAdvancedAdmission={setShowAdvancedAdmission}
            admissionSearch={admissionSearch}
            setAdmissionSearch={setAdmissionSearch}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            savingSection={savingSection}
            handleAdmissionSubmit={handleAdmissionSubmit}
            showCreateAdmission={showCreateAdmission}
            setShowCreateAdmission={setShowCreateAdmission}
            handleCreateAdmission={handleCreateAdmission}
            admissionSections={admissionSections}
          />
        )}

        {activeTab === 'insurance' && admission && (
          <InsurancePanel
            insurance={insurance}
            admission={admission}
            patient={patient}
            canManageClinical={canManageClinical}
            showAllInsuranceFields={showAllInsuranceFields}
            setShowAllInsuranceFields={setShowAllInsuranceFields}
            showAdvancedInsurance={showAdvancedInsurance}
            setShowAdvancedInsurance={setShowAdvancedInsurance}
            insuranceSearch={insuranceSearch}
            setInsuranceSearch={setInsuranceSearch}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            savingSection={savingSection}
            handleInsuranceSubmit={handleInsuranceSubmit}
            showCreateInsurance={showCreateInsurance}
            setShowCreateInsurance={setShowCreateInsurance}
            handleCreateInsurance={handleCreateInsurance}
            insuranceSections={insuranceSections}
            requiresInsurance={requiresInsurance}
          />
        )}

        {activeTab === 'referrals' && (
          <ReferralsPanel
            referralLetters={referralLetters}
            referralLoading={referralLoading}
            referralError={referralError}
            canManageClinical={canManageClinical}
            showCreateReferral={showCreateReferral}
            setShowCreateReferral={setShowCreateReferral}
            handleCreateReferral={handleCreateReferral}
            savingSection={savingSection}
            patientId={patient.id}
          />
        )} 

        {activeTab === 'add-ons' && (
          <AddOnsPanel
            addOnProcedures={addOnProcedures}
            addOnLoading={addOnLoading}
            addOnError={addOnError}
            canManageClinical={canManageClinical}
            showCreateAddOn={showCreateAddOn}
            setShowCreateAddOn={setShowCreateAddOn}
            handleCreateAddOnProcedure={handleCreateAddOnProcedure}
            savingSection={savingSection}
            patientId={patient.id}
          />
        )}

        <AiAnalysisModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          loading={aiAnalysisLoading}
          error={aiAnalysisError}
          analysisData={aiAnalysisData}
        />

        {showPafModal && (
          <GeneratePafModal
            patient={patient}
            admission={admission}
            insurance={insurance}
            onClose={() => setShowPafModal(false)}
          />
        )}

      </div>
    </div>
  );
}

export default PatientDisplayPage;
