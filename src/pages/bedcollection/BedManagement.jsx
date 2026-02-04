import { useEffect, useMemo, useState } from 'react';
import { initAuth } from '../../api/auth';
import { getPatients } from '../../api/patients';
import { getHospitalWards } from '../../api/hospitalWard';
import { createBed, deleteBed, getBeds, updateBed } from '../../api/bed';
import BedKpiCards from '../dashboard-widgets/BedKpiCards';
import BedForm from './BedForm';

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

      {showForm && canManage && (
        <BedForm
          wards={wards}
          initialData={activeBed}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setActiveBed(null);
          }}
          loading={saving}
        />
      )}

      {viewBed && (
        <div className="detail-section" style={{ marginBottom: '24px' }}>
          <div className="section-header">
            <h3>Bed Details</h3>
            <button className="btn-secondary" onClick={() => setViewBed(null)}>
              Close
            </button>
          </div>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Bed Number</label>
              <p>{viewBed.bed_no}</p>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <p>{viewBed.Status || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Category</label>
              <p>{viewBed.Category || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Ward</label>
              <p>{viewBed.select_ward?.ward_name || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Assigned Patient</label>
              <p>{viewBed.Patient?.patient_name || 'Unassigned'}</p>
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
