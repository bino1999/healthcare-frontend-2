import { useCallback, useEffect, useState } from 'react';
import { getReferralLettersByPatient } from '../api/Referralletter';

function useReferralLetters(patientId, enabled = true) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLetters = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getReferralLettersByPatient(patientId);
      setLetters(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch referral letters');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (!enabled) return;
    fetchLetters();
  }, [enabled, fetchLetters]);

  return {
    letters,
    loading,
    error,
    refresh: fetchLetters,
    setError
  };
}

export default useReferralLetters;
