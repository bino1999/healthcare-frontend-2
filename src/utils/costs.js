export const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const cleaned = String(value).replace(/,/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const parseAccommodationRate = (typeOfAccommodation = '') => {
  const match = String(typeOfAccommodation).match(/RM\s*([\d,]+(?:\.\d+)?)/i);
  if (!match) return 0;
  return toNumber(match[1]);
};

export const calculateTotalFee = (admission, procedures = []) => {
  if (!admission) return 0;
  const estimatedCost = toNumber(admission.estimated_cost_RM);
  const parsedDays = Number.parseInt(admission.expected_days_of_stay, 10);
  const expectedDays = Number.isFinite(parsedDays) ? parsedDays : 0;
  const accommodationFee =
    parseAccommodationRate(admission.type_of_accommodation) * expectedDays;
  const addOnTotal = (procedures || []).reduce(
    (sum, procedure) => sum + toNumber(procedure?.estimated_cost),
    0
  );
  const total = estimatedCost + accommodationFee + addOnTotal;
  return Math.round(total * 100) / 100;
};
