// src/components/Navbar.jsx
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Hospital Operation Portal</h2>
      </div>
      
      <div className="navbar-menu">
        <span className="navbar-user">
          {user?.first_name} {user?.last_name} ({user?.role?.name})
        </span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
