import { useEffect, useMemo, useState } from 'react';
import { getBeds } from '../../api/bed';
import './assignBedModal.css';

function AssignBedModal({ isOpen, patient, onClose, onAssign }) {
  const [beds, setBeds] = useState([]);
  const [totalFetched, setTotalFetched] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchBeds = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getBeds();
        console.log('Assign modal: fetched beds', data.length, (data || []).map(b => ({ id: b.id, Status: b.Status })));
        setTotalFetched((data || []).length || 0);
        const vacant = (data || []).filter(bed => {
          const status = (bed?.Status || '').toLowerCase();
          const noPatient = !(bed?.Patient && bed?.Patient.length > 0);
          return status.includes('vacant') || noPatient;
        });
        const excluded = (data || []).filter(bed => {
          const status = (bed?.Status || '').toLowerCase();
          const noPatient = !(bed?.Patient && bed?.Patient.length > 0);
          return !(status.includes('vacant') || noPatient);
        });
        console.log('Assign modal: vacant beds after filter', vacant.length, 'excluded', excluded.length, excluded.map(b => ({ id: b.id, Status: b.Status, Patient: b.Patient && b.Patient.length }))); 
        setBeds(vacant);
      } catch (err) {
        setError(err.message || 'Failed to fetch vacant beds');
      } finally {
        setLoading(false);
      }
    };

    fetchBeds();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedBedId('');
  }, [isOpen]);

  const selectedBed = useMemo(
    () => beds.find((bed) => bed.id === selectedBedId),
    [beds, selectedBedId]
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h3>Assign Bed</h3>
            <p>
              Select a vacant bed for{' '}
              <strong>{patient?.patient_name || 'patient'}</strong>
            </p>
          </div>
          <button className="modal-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading vacant beds...</div>
        ) : beds.length === 0 ? (
          <div className="empty-state">No vacant beds available.</div>
        ) : (
          <>
            <div className="modal-count">Showing {beds.length} vacant bed{beds.length !== 1 ? 's' : ''} (fetched {totalFetched} total)</div>
            <div className="modal-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Bed No</th>
                  <th>Ward</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {beds.map((bed) => (
                  <tr key={bed.id}>
                    <td>
                      <input
                        type="radio"
                        name="selectedBed"
                        value={bed.id}
                        checked={selectedBedId === bed.id}
                        onChange={() => setSelectedBedId(bed.id)}
                      />
                    </td>
                    <td>{bed.bed_no}</td>
                    <td>{bed.select_ward?.ward_name || 'N/A'}</td>
                    <td>{bed.Category || 'N/A'}</td>
                    <td>{bed.Status || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => selectedBed && onAssign(selectedBed)}
            type="button"
            disabled={!selectedBed}
          >
            Assign Bed
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignBedModal;
