import { buildAiPayload } from './buildAiPayload';
import { buildInsurancePredictionPrompt } from './insurancePrompt';
import { formatAiAnalysis } from './formatAiAnalysis';

export const analyzeClaimRisk = async ({ patient, admission, insurance, procedures }) => {
  const payload = buildAiPayload({ patient, admission, insurance, procedures });
  const prompt = buildInsurancePredictionPrompt(payload);
  const endpoint = import.meta.env.VITE_AI_ANALYSIS_URL;

  console.log('analyzeClaimRisk called with endpoint:', endpoint);

  if (!endpoint) {
    throw new Error('AI analysis endpoint is not configured. Set VITE_AI_ANALYSIS_URL.');
  }

  console.log('Sending request to:', endpoint);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, payload })
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Response error:', errorText);
    throw new Error(`AI analysis request failed: ${response.status} ${errorText}`);
  }

  let data;
  try {
    data = await response.json();
    console.log('Response data:', data);
  } catch (err) {
    data = await response.text();
    console.log('Response text:', data);
  }

  // Extract the result from response
  let rawText =
    data?.result ??
    data?.analysis ??
    data?.output ??
    data?.message ??
    data;

  console.log('Raw text:', rawText);

  // Parse JSON if it's wrapped in markdown code blocks
  let parsedData;
  if (typeof rawText === 'string') {
    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    const cleanedText = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    console.log('Cleaned text:', cleanedText);
    
    try {
      parsedData = JSON.parse(cleanedText);
      console.log('Parsed data:', parsedData);
    } catch (err) {
      console.error('Failed to parse JSON:', err);
      parsedData = rawText;
    }
  } else {
    parsedData = rawText;
  }

  // Map API response fields to component expected format
  const mappedData = {
    overallRiskLevel: parsedData?.risk_level || 'Unknown',
    fraudProbability: parsedData?.risk_probability_pct || 0,
    summary: parsedData?.summary || '',
    flaggedItems: (parsedData?.flagged_items || []).map(item => ({
      item: item.item,
      reason: item.reason,
      evidenceFields: item.evidence_fields
    })),
    costAnalysis: {
      estimatedTotal: parseFloat(parsedData?.amount_at_risk_rm) || 0,
      deviation: parsedData?.amount_at_risk_rm ? `RM ${parsedData.amount_at_risk_rm} at risk` : null
    },
    recommendations: parsedData?.recommendations || [],
    missingInformation: parsedData?.missing_info || [],
    dataQualityFlags: parsedData?.data_quality_flags || [],
    notes: parsedData?.data_quality_flags?.join(' ') || ''
  };

  console.log('Mapped data:', mappedData);

  const formatted = formatAiAnalysis(parsedData);

  return {
    payload,
    prompt,
    raw: mappedData,
    formatted
  };
};
