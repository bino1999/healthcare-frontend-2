import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initAuth } from '../../api/auth';
import Navbar from '../../components/Navbar';
import BedManagement from './BedManagement';
import HospitalWardManagement from './HospitalWardManagement';

function WardBedManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('wards');

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

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div>
      <Navbar user={user} />

      <div className="page-container">
        <div className="page-header">
          <div>
            <button onClick={handleBack} className="btn-secondary">← Back</button>
            <h1 style={{ marginTop: '12px' }}>Ward & Bed Management</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            className={activeTab === 'wards' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('wards')}
          >
            Wards
          </button>
          <button
            className={activeTab === 'beds' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('beds')}
          >
            Beds
          </button>
        </div>

        {activeTab === 'wards' ? (
          <HospitalWardManagement embedded />
        ) : (
          <BedManagement embedded />
        )}
      </div>
    </div>
  );
}

export default WardBedManagement;
