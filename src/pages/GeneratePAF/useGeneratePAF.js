// src/pages/GeneratePAF/useGeneratePAF.js
import { useState, useCallback } from 'react';
import { generatePAF, validatePafData, clearInsurancePdfUrl, pollForPdfUrl, downloadPdf } from './pafApi';

/**
 * Custom hook for PAF generation with PDF polling & auto-download
 * @returns {Object} Hook state and methods
 */
export function useGeneratePAF() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState(null);
  const [phase, setPhase] = useState(''); // 'sending' | 'waiting' | 'downloading' | ''
  const [pollInfo, setPollInfo] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);

  const generate = useCallback(async (patient, admission, insurance) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setResponse(null);
    setPhase('sending');
    setPollInfo('');
    setPdfUrl(null);

    // Validate data first
    const validation = validatePafData(patient, admission, insurance);
    if (!validation.isValid) {
      setError(`Missing required fields: ${validation.missingFields.join(', ')}`);
      setLoading(false);
      setPhase('');
      return { success: false, error: `Missing: ${validation.missingFields.join(', ')}` };
    }

    try {
      // Step 1: Clear old pdf_url so we can detect the new one
      await clearInsurancePdfUrl(insurance.id);

      // Step 2: Trigger the flow via n8n webhook
      setPhase('sending');
      const result = await generatePAF(patient, admission, insurance);
      setResponse(result);

      // Step 3: Poll Directus for the pdf_url to appear on the insurance record
      setPhase('waiting');
      setPollInfo('Waiting for PDF to be generated...');

      const url = await pollForPdfUrl(insurance.id, {
        interval: 3000,
        timeout: 90000,
        onProgress: ({ attempt, elapsed }) => {
          setPollInfo(`Waiting for PDF... (${elapsed}s elapsed)`);
        },
      });

      // Step 4: PDF URL found — auto-download
      setPhase('downloading');
      setPdfUrl(url);
      const filename = `PAF_${patient.mrn || patient.patient_name || 'document'}.pdf`;
      downloadPdf(url, filename);

      setSuccess(true);
      setPhase('');
      return { success: true, data: result, pdfUrl: url };
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate PAF';
      setError(errorMessage);
      setPhase('');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError('');
    setSuccess(false);
    setResponse(null);
    setPhase('');
    setPollInfo('');
    setPdfUrl(null);
  }, []);

  return {
    loading,
    error,
    success,
    response,
    phase,
    pollInfo,
    pdfUrl,
    generate,
    reset
  };
}

export default useGeneratePAF;
