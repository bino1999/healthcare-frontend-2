import { calculateTotalFee } from '../utils/costs';

export const buildAiPayload = ({ patient, admission, insurance, procedures }) => {
  const total_fee =
    patient?.total_fee ?? calculateTotalFee(admission, procedures || []);

  return {
    patient: {
      id: patient?.id ?? null,
      patient_name: patient?.patient_name ?? null,
      mrn: patient?.mrn ?? null,
      date_of_birth: patient?.date_of_birth ?? null,
      NRIC: patient?.NRIC ?? null,
      gender: patient?.gender ?? null
    },
    admission: {
      id: admission?.id ?? null,
      status: admission?.status ?? null,
      admission_date: admission?.admission_date ?? null,
      admission_time: admission?.admission_time ?? null,
      admission_to: admission?.admission_to ?? null,
      financial_class: admission?.financial_class ?? null,
      diagnosis: admission?.diagnosis ?? null,
      type_of_accommodation: admission?.type_of_accommodation ?? null,
      expected_days_of_stay: admission?.expected_days_of_stay ?? null,
      estimated_cost_RM: admission?.estimated_cost_RM ?? null,
      type_of_operation_or_procedure: admission?.type_of_operation_or_procedure ?? null,
      urgent_investigations: admission?.urgent_investigations ?? [],
      endoscopy_procedures: admission?.endoscopy_procedures ?? []
    },
    insurance: {
      id: insurance?.id ?? null,
      Policy_No: insurance?.Policy_No ?? null,
      tpa_name: insurance?.tpa_name ?? null,
      IGL_number: insurance?.IGL_number ?? null,
      IGL_status: insurance?.IGL_status ?? null,
      estimated_cost: insurance?.estimated_cost ?? null,
      expected_days_of_stay: insurance?.expected_days_of_stay ?? null,
      admission_reason: insurance?.admission_reason ?? null,
      diagnosis: insurance?.diagnosis ?? null,
      condition_related_to: insurance?.condition_related_to ?? [],
      was_this_patient_referred: insurance?.was_this_patient_referred ?? null,
      patient_referred_details: insurance?.patient_referred_details ?? null
    },
    add_on_procedures: (procedures || []).map((item) => ({
      id: item?.id ?? null,
      plan_date: item?.plan_date ?? null,
      estimated_cost: item?.estimated_cost ?? null,
      procedure_description: item?.procedure_description ?? null
    })),
    total_fee
  };
};
