import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initAuth } from '../../api/auth';
import {
  createHospitalWard,
  deleteHospitalWard,
  getHospitalWards,
  updateHospitalWard
} from '../../api/hospitalWard';
import Navbar from '../../components/Navbar';
import HospitalWardForm from './Hospitalwardform';

function HospitalWardManagement({ embedded = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeWard, setActiveWard] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const authenticatedUser = await initAuth();
      if (!authenticatedUser) {
        navigate('/login');
        return;
      }
      setUser(authenticatedUser);
    };

    initialize();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    fetchWards();
  }, [user]);

  const canManage = useMemo(() => {
    const roleName = user?.role?.name;
    return roleName === 'Administrator' || roleName === 'Hospital_staff' || roleName === 'Hospital Staff';
  }, [user]);

  const fetchWards = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHospitalWards();
      setWards(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch wards');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const roleName = user?.role?.name;
    if (roleName === 'Doctor') {
      navigate('/doctor-dashboard');
    } else if (roleName === 'Administrator') {
      navigate('/admin-dashboard');
    } else if (roleName === 'Hospital_staff' || roleName === 'Hospital Staff') {
      navigate('/staff-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleCreate = () => {
    setActiveWard(null);
    setShowForm(true);
  };

  const handleEdit = (ward) => {
    setActiveWard(ward);
    setShowForm(true);
  };

  const handleDelete = async (ward) => {
    if (!window.confirm(`Delete ward ${ward.ward_name || ''}?`)) return;
    setSaving(true);
    setError('');
    try {
      await deleteHospitalWard(ward.id);
      await fetchWards();
    } catch (err) {
      setError(err.message || 'Failed to delete ward');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError('');
    try {
      if (activeWard?.id) {
        await updateHospitalWard(activeWard.id, formData);
      } else {
        await createHospitalWard(formData);
      }
      setShowForm(false);
      setActiveWard(null);
      await fetchWards();
    } catch (err) {
      setError(err.message || 'Failed to save ward');
    } finally {
      setSaving(false);
    }
  };

  const formatRoomTypes = (types) => {
    if (!types || types.length === 0) return 'N/A';
    return Array.isArray(types) ? types.join(', ') : types;
  };

  if (!embedded && !user) return <div className="loading">Loading...</div>;

  return (
    <div>
      {!embedded && <Navbar user={user} />}

      <div className={embedded ? '' : 'page-container'}>
        <div className="page-header">
          <div>
            {!embedded && (
              <button onClick={handleBack} className="btn-secondary">← Back</button>
            )}
            <h1 style={{ marginTop: embedded ? 0 : '12px' }}>
              Hospital Wards
            </h1>
          </div>
          {canManage && (
            <button onClick={handleCreate} className="btn-primary">
              + Create Ward
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {showForm && canManage && (
          <HospitalWardForm
            initialData={activeWard}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setActiveWard(null);
            }}
            loading={saving}
          />
        )}

        {loading ? (
          <div className="loading">Loading wards...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ward Name</th>
                  <th>Ward Code</th>
                  <th>Ward Type</th>
                  <th>Critical Care</th>
                  <th>Floor</th>
                  <th>Building</th>
                  <th>Room Types</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {wards.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 8 : 7} className="text-center">
                      No wards found.
                    </td>
                  </tr>
                ) : (
                  wards.map((ward) => (
                    <tr key={ward.id}>
                      <td><strong>{ward.ward_name}</strong></td>
                      <td>{ward.ward_code}</td>
                      <td>{ward.ward_type_ || 'N/A'}</td>
                      <td>{ward.is_critical_care || 'N/A'}</td>
                      <td>{ward.floor_number_ || 'N/A'}</td>
                      <td>{ward.building_block || 'N/A'}</td>
                      <td>{formatRoomTypes(ward.room_types_available)}</td>
                      {canManage && (
                        <td className="actions">
                          <button
                            onClick={() => handleEdit(ward)}
                            className="btn-edit"
                            disabled={saving}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(ward)}
                            className="btn-delete"
                            disabled={saving}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HospitalWardManagement;
