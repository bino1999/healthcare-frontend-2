import PatientSummaryCard from '../PatientSummaryCard';
import SectionSearch from '../SectionSearch';
import DetailGrid from '../DetailGrid';
import DetailSection from '../DetailSection';
import PatientForm from '../../forms/PatientForm';

function OverviewPanel({ isStaffView, patient, admission, insurance, patientSearch, setPatientSearch, editingSection, setEditingSection, savingSection, handlePatientSubmit }) {
  const patientDetails = [
    { label: 'Patient Name', value: patient.patient_name },
    { label: 'MRN', value: patient.mrn },
    { label: 'Date of Birth', value: patient.date_of_birth },
    { label: 'NRIC', value: patient.NRIC },
    { label: 'Gender', value: patient.gender },
    { label: 'Contact Number', value: patient.contact_number },
    { label: 'Email', value: patient.email }
  ];

  const staffDetails = [
    { label: 'Patient Name', value: patient.patient_name },
    { label: 'MRN', value: patient.mrn },
    { label: 'Insurance Company', value: insurance?.tpa_name || 'N/A' },
    { label: 'IGL Status', value: insurance?.IGL_status || 'N/A' },
    { label: 'Policy Number', value: insurance?.Policy_No || 'N/A' },
    { label: 'IGL Number', value: insurance?.IGL_number || 'N/A' },
    { label: 'Date Created', value: patient.date_created }
  ];

  return (
    <>
      {isStaffView ? (
        <DetailSection title="Patient Summary" subtitle="Staff view" isEditing={false} onEdit={() => {}} showEdit={false}>
          <SectionSearch value={patientSearch} onChange={setPatientSearch} placeholder="Search patient details" />
          <DetailGrid items={staffDetails} />
        </DetailSection>
      ) : (
        <DetailSection title="Patient Details" subtitle="Full patient information" isEditing={editingSection === 'patient'} onEdit={() => setEditingSection(editingSection === 'patient' ? null : 'patient')} showEdit>
          {editingSection === 'patient' ? (
            <PatientForm initialData={patient} onSubmit={handlePatientSubmit} onCancel={() => setEditingSection(null)} loading={savingSection === 'patient'} submitLabel="Save Patient" loadingLabel="Saving..." cancelLabel="Cancel" />
          ) : (
            <>
              <SectionSearch value={patientSearch} onChange={setPatientSearch} placeholder="Search patient details" />
              <DetailGrid items={patientDetails} />
            </>
          )}
        </DetailSection>
      )}
    </>
  );
}

export default OverviewPanel;
