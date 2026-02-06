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
import PatientForm from '../forms/PatientForm';
import AdmissionForm from '../forms/AdmissionForm';
import InsuranceForm from '../forms/InsuranceForm';
import ReferralLetterForm from '../ReferralLetter/ReferralLetterForm';
import ReferralLetterDetails from '../ReferralLetter/ReferralLetterDetails';
import AddOnProceduresForm from '../Add_on_Procedures/AddOnProceduresForm';
import AddOnProceduresDetails from '../Add_on_Procedures/AddOnProceduresDetails';
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
    error,
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
      {
        title: 'Insurance Basics',
        items: [
          { label: 'Policy Number', value: insurance.Policy_No },
          { label: 'TPA Name', value: insurance.tpa_name },
          { label: 'IGL Number', value: insurance.IGL_number },
          { label: 'IGL Status', value: insurance.IGL_status }
        ]
      },
      {
        title: 'Admission & Cost',
        items: [
          { label: 'Admission Reason', value: insurance.admission_reason },
          { label: 'Expected Days of Stay', value: insurance.expected_days_of_stay },
          { label: 'Estimated Cost', value: insurance.estimated_cost }
        ]
      },
      {
        title: 'Accident / Illness',
        items: [
          { label: 'Accident Date', value: formatDate(insurance.accident_date) },
          { label: 'Accident Time', value: insurance.accident_time },
          { label: 'Accident Details', value: insurance.accident_details },
          { label: 'Illness Symptoms First Appeared On', value: formatDate(insurance.illness_symptoms_first_appeared_on_date) },
          { label: 'Doctors Consulted', value: insurance.doctors_consulted_for_this_illness },
          { label: 'Doctor / Clinic Contact', value: insurance.doctors_or_clinic_contact }
        ]
      },
      {
        title: 'Diagnosis & Assessment',
        items: [
          { label: 'Diagnosis', value: insurance.diagnosis },
          { label: 'How Long Aware', value: insurance.how_long_is_person_aware_of_this_condition },
          { label: 'Blood Pressure', value: insurance.blood_pressure },
          { label: 'Temperature', value: insurance.temperature },
          { label: 'Pulse', value: insurance.pulse },
          { label: 'Date First Consulted', value: formatDate(insurance.date_first_consulted) },
          { label: 'Previous Consultation', value: insurance.any_previous_consultaion },
          { label: 'Previous Consultation Details', value: insurance.details_of_previous_consultation }
        ]
      },
      {
        title: 'Referral & History',
        advanced: true,
        items: [
          { label: 'Was Patient Referred', value: insurance.was_this_patient_referred },
          { label: 'Patient Referred Details', value: insurance.patient_referred_details },
          { label: 'Condition Exist Before', value: insurance.condition_exist_before },
          { label: 'Date', value: formatDate(insurance.date) },
          { label: 'Disease or Disorder', value: insurance.disease_or_disorder },
          { label: 'Treatment / Hospitalization Details', value: insurance.treatment_or_hospitalization_details },
          { label: 'Doctor / Hospital / Clinic', value: insurance.doctor_or_hospital_or_clinic }
        ]
      },
      {
        title: 'Condition & Other Details',
        advanced: true,
        items: [
          { label: 'Condition Related To', value: insurance.condition_related_to },
          { label: 'Condition Can Be Managed', value: insurance.condition_be_managed },
          { label: 'Reason for Admission', value: insurance.reason_for_admission },
          { label: 'Other Notes', value: insurance.others }
        ]
      },
      {
        title: 'Pregnancy',
        advanced: true,
        items: [
          { label: 'Pregnant Information', value: insurance.pregnant_information },
          { label: 'Pregnancy Duration', value: insurance.pregnancy_duration }
        ]
      }
    ];
  }, [insurance]);

  const isEmptyValue = (value) => {
    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

  const filterItems = (items, showAll) =>
    showAll ? items : items.filter((item) => !isEmptyValue(item.value));

  const filterItemsBySearch = (items, searchTerm) => {
    if (!searchTerm) return items;
    const query = searchTerm.toLowerCase();
    return items.filter((item) =>
      `${item.label} ${item.value ?? ''}`.toLowerCase().includes(query)
    );
  };

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
    if (!insuranceId) return;
    setSavingSection('insurance');
    setError('');
    try {
      const { pation, ...payload } = formData;
      await updatePatientInsurance(insuranceId, payload);
      setEditingSection(null);
      refreshPatient();
    } catch (err) {
      // error handled by hook
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
    { key: 'admission', label: 'Admission', hidden: isStaffView },
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
            <div className="header-actions-group">
              {canManageClinical && !admission && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setActiveTab('admission');
                    setShowCreateAdmission(true);
                  }}
                >
                  + Admission
                </button>
              )}
              {/* {canManageClinical && admission && requiresInsurance && !insurance && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setActiveTab('insurance');
                    setShowCreateInsurance(true);
                  }}
                >
                  + Insurance
                </button>
              )} */}
              {canManageClinical && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setActiveTab('referrals');
                    setShowCreateReferral(true);
                  }}
                >
                  + Referral
                </button>
              )}
              {canManageClinical && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setActiveTab('add-ons');
                    setShowCreateAddOn(true);
                  }}
                >
                  + Add-on Procedure
                </button>
              )}
              {admission && insurance && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowPafModal(true)}
                >
                  Generate PAF
                </button>
              )}
              {/* {canManageClinical && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleRunAiAnalysis}
                  disabled={aiAnalysisLoading}
                >
                  {aiAnalysisLoading ? 'Running Predictive Claims ...' : '+ Predictive Claims '}
                </button>
              )} */}
            </div>
          }
        />

        {error && <div className="error-message">{error}</div>}

        <PatientSummaryCard patient={patient} admission={admission} insurance={insurance} />

        <SectionTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'overview' && (isStaffView ? (
          <DetailSection
            title="Patient Summary"
            subtitle="Staff view"
            isEditing={false}
            onEdit={() => {}}
            showEdit={false}
          >
            <SectionSearch
              value={patientSearch}
              onChange={setPatientSearch}
              placeholder="Search patient details"
            />
            <DetailGrid items={filterItemsBySearch(staffDetails, patientSearch)} />
          </DetailSection>
        ) : (
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
              <>
                <SectionSearch
                  value={patientSearch}
                  onChange={setPatientSearch}
                  placeholder="Search patient details"
                />
                <DetailGrid items={filterItemsBySearch(patientDetails, patientSearch)} />
              </>
            )}
          </DetailSection>
        ))}

        {activeTab === 'admission' && !isStaffView && (
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
                <>
                  <div className="detail-actions">
                    <button
                      type="button"
                      className="toggle-btn"
                      onClick={() => setShowAllAdmissionFields((prev) => !prev)}
                    >
                      {showAllAdmissionFields ? 'Hide empty fields' : 'Show empty fields'}
                    </button>
                    <button
                      type="button"
                      className="toggle-btn"
                      onClick={() => setShowAdvancedAdmission((prev) => !prev)}
                    >
                      {showAdvancedAdmission ? 'Hide advanced' : 'Show advanced'}
                    </button>
                  </div>
                  <SectionSearch
                    value={admissionSearch}
                    onChange={setAdmissionSearch}
                    placeholder="Search admission details"
                  />
                  <div className="detail-groups">
                    {admissionSections.map((section) => {
                      const items = filterItems(section.items, showAllAdmissionFields);
                      const filtered = filterItemsBySearch(items, admissionSearch);
                      if (section.advanced && !showAdvancedAdmission) return null;
                      if (filtered.length === 0) return null;
                      return (
                        <div key={section.title} className="detail-group">
                          <h4 className="detail-group-title">{section.title}</h4>
                          <DetailGrid items={filtered} />
                        </div>
                      );
                    })}
                  </div>
                </>
              )
            ) : showCreateAdmission ? (
              <AdmissionForm
                patientId={patient.id}
                onSubmit={handleCreateAdmission}
                onCancel={() => setShowCreateAdmission(false)}
                loading={savingSection === 'create-admission'}
                submitLabel="Create Admission"
                loadingLabel="Creating..."
                cancelLabel="Cancel"
              />
            ) : (
              <div className="empty-state">
                This patient has no admission record yet.
                {canManageClinical && (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ marginTop: '12px' }}
                    onClick={() => setShowCreateAdmission(true)}
                  >
                    + Create Admission
                  </button>
                )}
              </div>
            )}
          </DetailSection>
        )}

        {activeTab === 'insurance' && admission && (
          <DetailSection
            title="Insurance Details"
            subtitle="Full insurance record"
            isEditing={editingSection === 'insurance'}
            onEdit={() => setEditingSection(editingSection === 'insurance' ? null : 'insurance')}
            showEdit={Boolean(insurance) && canManageClinical}
          >
            {insurance ? (
              editingSection === 'insurance' && canManageClinical ? (
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
                <>
                  <div className="detail-actions">
                    <button
                      type="button"
                      className="toggle-btn"
                      onClick={() => setShowAllInsuranceFields((prev) => !prev)}
                    >
                      {showAllInsuranceFields ? 'Hide empty fields' : 'Show empty fields'}
                    </button>
                    <button
                      type="button"
                      className="toggle-btn"
                      onClick={() => setShowAdvancedInsurance((prev) => !prev)}
                    >
                      {showAdvancedInsurance ? 'Hide advanced' : 'Show advanced'}
                    </button>
                  </div>
                  <SectionSearch
                    value={insuranceSearch}
                    onChange={setInsuranceSearch}
                    placeholder="Search insurance details"
                  />
                  <div className="detail-groups">
                    {insuranceSections.map((section) => {
                      const items = filterItems(section.items, showAllInsuranceFields);
                      const filtered = filterItemsBySearch(items, insuranceSearch);
                      if (section.advanced && !showAdvancedInsurance) return null;
                      if (filtered.length === 0) return null;
                      return (
                        <div key={section.title} className="detail-group">
                          <h4 className="detail-group-title">{section.title}</h4>
                          <DetailGrid items={filtered} />
                        </div>
                      );
                    })}
                  </div>
                </>
              )
            ) : requiresInsurance ? (
              showCreateInsurance && canManageClinical ? (
                <InsuranceForm
                  patientId={patient.id}
                  onSubmit={handleCreateInsurance}
                  onCancel={() => setShowCreateInsurance(false)}
                  loading={savingSection === 'create-insurance'}
                  submitLabel="Create Insurance"
                  loadingLabel="Creating..."
                  cancelLabel="Cancel"
                  skipLabel="Skip"
                  onSkip={() => setShowCreateInsurance(false)}
                />
              ) : (
                <div className="empty-state">
                  This patient has no insurance record yet.
                  {canManageClinical && (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ marginTop: '12px' }}
                      onClick={() => setShowCreateInsurance(true)}
                    >
                      + Create Insurance
                    </button>
                  )}
                </div>
              )
            ) : (
              <div className="empty-state">
                Insurance is required only for Guarantee Letter admissions.
              </div>
            )}
          </DetailSection>
        )}

        {activeTab === 'referrals' && (
          <DetailSection
            title="Referral Letters"
            subtitle="Referral history for this patient"
            isEditing={false}
            onEdit={() => {}}
            showEdit={false}
          >
            {canManageClinical && !showCreateReferral && (
              <div className="detail-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShowCreateReferral(true)}
                >
                  <span className="icon">+</span>
                  Create Referral Letter
                </button>
              </div>
            )}

            {canManageClinical && showCreateReferral && (
              <ReferralLetterForm
                patientId={patient.id}
                onSubmit={handleCreateReferral}
                onCancel={() => setShowCreateReferral(false)}
                loading={savingSection === 'create-referral'}
              />
            )}

            <ReferralLetterDetails
              letters={referralLetters}
              loading={referralLoading}
              error={referralError}
            />
          </DetailSection>
        )}

        {activeTab === 'add-ons' && (
          <DetailSection
            title="Add-on Procedures"
            subtitle="Procedures linked to this patient"
            isEditing={false}
            onEdit={() => {}}
            showEdit={false}
          >
            {canManageClinical && !showCreateAddOn && (
              <div className="detail-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShowCreateAddOn(true)}
                >
                  <span className="icon">+</span>
                  Create Add-on Procedure
                </button>
              </div>
            )}

            {canManageClinical && showCreateAddOn && (
              <AddOnProceduresForm
                patientId={patient.id}
                onSubmit={handleCreateAddOnProcedure}
                onCancel={() => setShowCreateAddOn(false)}
                loading={savingSection === 'create-add-on'}
              />
            )}

            <AddOnProceduresDetails
              procedures={addOnProcedures}
              loading={addOnLoading}
              error={addOnError}
            />
          </DetailSection>
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
