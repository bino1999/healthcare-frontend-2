// src/pages/DashboardPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth';

function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect based on role
    if (user.role?.name === 'Doctor') {
      navigate('/doctor-dashboard');
    } else if (user.role?.name === 'Hospital_staff' || user.role?.name === 'Hospital Staff') {
      navigate('/staff-dashboard');
    } 
    else if (user.role?.name === 'Administrator') {
      navigate('/admin-dashboard');
    }else {
      alert('Unknown user role');
      navigate('/login');
    }
  }, [navigate]);

  return <div className="loading">Redirecting...</div>;
}

export default DashboardPage;
