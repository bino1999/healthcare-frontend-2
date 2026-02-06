export const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const cleaned = String(value).replace(/,/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

// Total fee is simply the Estimated Cost (RM) from admission form - no calculations needed
export const calculateTotalFee = (admission) => {
  if (!admission) return 0;
  return toNumber(admission.estimated_cost_RM);
};
