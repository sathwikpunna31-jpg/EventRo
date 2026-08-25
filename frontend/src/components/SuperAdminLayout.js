import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { 
  LuLayoutDashboard, 
  LuBuilding2, 
  LuMegaphone, 
  LuLogOut 
} from "react-icons/lu";
import './SuperAdminLayout.css';

function SuperAdminLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="super-layout">
      <aside className="super-sidebar">
        <div>
          <div className="sidebar-brand-super" style={{ padding: '0', borderBottom: 'none', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img src="/logo.jpg.png" alt="Eventro Logo" style={{ width: '100%', maxWidth: '160px' }} />
          </div>
          <nav>
            <ul>
              <li>
                <NavLink to="/superadmin/dashboard">
                  <span className="sidebar-icon"><LuLayoutDashboard /></span> Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/superadmin/colleges">
                  <span className="sidebar-icon"><LuBuilding2 /></span> Manage Colleges
                </NavLink>
              </li>
              <li>
                <NavLink to="/superadmin/announcements">
                  <span className="sidebar-icon"><LuMegaphone /></span> Broadcast notification
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="sidebar-logout-btn" style={{ width: '100%', marginTop: '0.5rem' }}>
                  <span className="sidebar-icon"><LuLogOut /></span> Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="super-content">
        <Outlet />
      </main>
    </div>
  );
}

export default SuperAdminLayout;
