import { useCallback, useEffect, useState } from 'react';
import { getPatient } from '../api/patients';

function usePatient(patientId, enabled = true) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatient = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getPatient(patientId);
      setPatient(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch patient');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (!enabled) return;
    fetchPatient();
  }, [enabled, fetchPatient]);

  return {
    patient,
    loading,
    error,
    refresh: fetchPatient
  };
}

export default usePatient;
