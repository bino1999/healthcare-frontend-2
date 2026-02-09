import { useEffect, useMemo, useState } from 'react';
import { initAuth } from '../../api/auth';
import { getPatients } from '../../api/patients';
import { getHospitalWards } from '../../api/hospitalWard';
import { createBed, deleteBed, getBeds, updateBed } from '../../api/bed';
import BedKpiCards from '../dashboard-widgets/BedKpiCards';
import BedForm from './BedForm';
import './assignBedModal.css';

function BedManagement({ embedded = false }) {
  const [user, setUser] = useState(null);
  const [beds, setBeds] = useState([]);
  const [wards, setWards] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeBed, setActiveBed] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewBed, setViewBed] = useState(null);
  const [kpiRefreshKey, setKpiRefreshKey] = useState(0);

  useEffect(() => {
    const initialize = async () => {
      const authenticatedUser = await initAuth();
      if (!authenticatedUser) return;
      setUser(authenticatedUser);
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const canManage = useMemo(() => {
    const roleName = user?.role?.name;
    return roleName === 'Administrator' || roleName === 'Hospital_staff' || roleName === 'Hospital Staff';
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [bedData, wardData, patientData] = await Promise.all([
        getBeds(),
        getHospitalWards(),
        getPatients()
      ]);
      setBeds(bedData);
      setWards(wardData);
      setPatients(patientData);
      setKpiRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch beds');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setActiveBed(null);
    setShowForm(true);
  };

  const handleEdit = (bed) => {
    setActiveBed(bed);
    setShowForm(true);
  };

  const handleDelete = async (bed) => {
    if (!window.confirm(`Delete bed ${bed.bed_no || ''}?`)) return;
    setSaving(true);
    setError('');
    try {
      await deleteBed(bed.id);
      await fetchAll();
    } catch (err) {
      setError(err.message || 'Failed to delete bed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError('');
    try {
      if (activeBed?.id) {
        await updateBed(activeBed.id, formData);
      } else {
        await createBed(formData);
      }
      setShowForm(false);
      setActiveBed(null);
      await fetchAll();
    } catch (err) {
      setError(err.message || 'Failed to save bed');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModals = () => {
    if (!saving) {
      setShowForm(false);
      setActiveBed(null);
      setViewBed(null);
    }
  };

  const renderSection = () => (
    <div className={embedded ? '' : 'page-container'}>
      <div className="page-header">
        <h2>Bed Management</h2>
        {canManage && (
          <button onClick={handleCreate} className="btn-primary">
            + Create Bed
          </button>
        )}
      </div>

      <BedKpiCards refreshKey={kpiRefreshKey} />

      {error && <div className="error-message">{error}</div>}

      {/* Bed Form Modal */}
      {showForm && canManage && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div>
                <h3>{activeBed ? 'Edit Bed' : 'Create New Bed'}</h3>
                <p>{activeBed ? `Editing bed ${activeBed.bed_no}` : 'Add a new bed to the system'}</p>
              </div>
              <button 
                className="modal-close" 
                onClick={handleCloseModals} 
                type="button"
                disabled={saving}
              >
                ✕
              </button>
            </div>
            <BedForm
              wards={wards}
              initialData={activeBed}
              onSubmit={handleSubmit}
              onCancel={handleCloseModals}
              loading={saving}
            />
          </div>
        </div>
      )}

      {/* Bed View Modal */}
      {viewBed && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div>
                <h3>Bed Details</h3>
                <p>Viewing bed <strong>{viewBed.bed_no}</strong></p>
              </div>
              <button className="modal-close" onClick={() => setViewBed(null)} type="button">
                ✕
              </button>
            </div>
            <div className="bed-view-details">
              <div className="bed-detail-row">
                <span className="bed-detail-label">Bed Number</span>
                <span className="bed-detail-value">{viewBed.bed_no}</span>
              </div>
              <div className="bed-detail-row">
                <span className="bed-detail-label">Status</span>
                <span className={`bed-status-tag ${(viewBed.Status || '').toLowerCase()}`}>
                  {viewBed.Status || 'N/A'}
                </span>
              </div>
              <div className="bed-detail-row">
                <span className="bed-detail-label">Category</span>
                <span className="bed-detail-value">{viewBed.Category || 'N/A'}</span>
              </div>
              <div className="bed-detail-row">
                <span className="bed-detail-label">Ward</span>
                <span className="bed-detail-value">{viewBed.select_ward?.ward_name || 'N/A'}</span>
              </div>
              <div className="bed-detail-row">
                <span className="bed-detail-label">Assigned Patient</span>
                <span className="bed-detail-value">
                  {viewBed.Patient?.[0]?.patient_name || viewBed.Patient?.patient_name || 'Unassigned'}
                </span>
              </div>
            </div>
            <div className="modal-actions">
              {canManage && (
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setViewBed(null);
                    handleEdit(viewBed);
                  }}
                >
                  Edit Bed
                </button>
              )}
              <button className="btn-secondary" onClick={() => setViewBed(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading beds...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bed No</th>
                <th>Status</th>
                <th>Category</th>
                <th>Ward</th>
                <th>Assigned Patient</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {beds.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No beds found.
                  </td>
                </tr>
              ) : (
                beds.map((bed) => (
                  <tr key={bed.id}>
                    <td>{bed.bed_no}</td>
                    <td>{bed.Status || 'N/A'}</td>
                    <td>{bed.Category || 'N/A'}</td>
                    <td>{bed.select_ward?.ward_name || 'N/A'}</td>
                    <td>{bed.Patient[0]?.patient_name || 'Unassigned'}</td>
                    <td className="actions">
                      <button
                        onClick={() => setViewBed(bed)}
                        className="btn-view"
                      >
                        View
                      </button>
                      {canManage && (
                        <>
                          <button
                            onClick={() => handleEdit(bed)}
                            className="btn-edit"
                            disabled={saving}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(bed)}
                            className="btn-delete"
                            disabled={saving}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (!embedded && !user) return <div className="loading">Loading...</div>;

  return renderSection();
}

export default BedManagement;
