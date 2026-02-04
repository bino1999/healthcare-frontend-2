import { useCallback, useEffect, useState } from 'react';
import { getAddOnProceduresByPatient } from '../api/addOnProcedures';

function useAddOnProcedures(patientId, enabled = true) {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProcedures = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getAddOnProceduresByPatient(patientId);
      setProcedures(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch add-on procedures');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (!enabled) return;
    fetchProcedures();
  }, [enabled, fetchProcedures]);

  return {
    procedures,
    loading,
    error,
    refresh: fetchProcedures,
    setError
  };
}

export default useAddOnProcedures;
