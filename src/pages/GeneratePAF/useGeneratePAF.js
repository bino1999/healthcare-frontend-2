// src/pages/GeneratePAF/useGeneratePAF.js
import { useState, useCallback } from 'react';
import { generatePAF, validatePafData } from './pafApi';

/**
 * Custom hook for PAF generation
 * @returns {Object} Hook state and methods
 */
export function useGeneratePAF() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState(null);

  const generate = useCallback(async (patient, admission, insurance) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setResponse(null);

    // Validate data first
    const validation = validatePafData(patient, admission, insurance);
    if (!validation.isValid) {
      setError(`Missing required fields: ${validation.missingFields.join(', ')}`);
      setLoading(false);
      return { success: false, error: `Missing: ${validation.missingFields.join(', ')}` };
    }

    try {
      const result = await generatePAF(patient, admission, insurance);
      setResponse(result);
      setSuccess(true);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate PAF';
      setError(errorMessage);
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
  }, []);

  return {
    loading,
    error,
    success,
    response,
    generate,
    reset
  };
}

export default useGeneratePAF;
