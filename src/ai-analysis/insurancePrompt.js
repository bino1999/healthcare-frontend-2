export const buildInsurancePredictionPrompt = (payload) => `ROLE: Expert Medical Claims Auditor & AI Bill Analyst (Malaysia, private hospital).
TASK: Predict claim rejection risk using ONLY the provided payload. Do not invent facts. If data is missing, list it.

INPUT JSON:
${JSON.stringify(payload, null, 2)}

RULES:
- Validate medical necessity: Procedures/Investigations must align with primary diagnosis; flag mismatches.
- Consider Malaysian 13th Schedule limits for consultations/professional fees. If fee limits are NOT present in payload, state "schedule_data_missing" and avoid exact limit claims.
- Rejection triggers: DX mismatch, fee excess, lack of documentation.
- Provide estimates with confidence and cite which fields were used.

OUTPUT: Strict JSON (no markdown) with schema:
{
  "risk_level": "LOW|MEDIUM|HIGH|VERY HIGH",
  "risk_probability_pct": 0-100,
  "amount_at_risk_rm": number,
  "flagged_items": [
    {
      "item": string,
      "reason": "DX MISMATCH|FEE EXCESS|LACK OF DOCUMENTATION|OTHER",
      "evidence_fields": [string]
    }
  ],
  "recommendations": [string],
  "missing_info": [string],
  "data_quality_flags": [string],
  "summary": string
}

If unsure, set risk_level to MEDIUM and explain in summary.`.trim();
