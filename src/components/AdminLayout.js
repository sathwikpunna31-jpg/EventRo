import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
  LuLayoutDashboard,
  LuCalendarDays,
  LuPencilLine,
  LuMegaphone,
  LuChartBar,
  LuSettings,
  LuLogOut,
  LuHouse,
  LuUsers
} from "react-icons/lu";
import './AdminLayout.css';

function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check if current user is a Club Coordinator
  const isCoordinator = user?.role === 'clubCoordinator';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <div className="sidebar-brand-container">
            <img src="/logo.jpg.png" alt="EVENTRO Logo" className="sidebar-brand-img" />
          </div>
          <nav className="sidebar-nav">
            <ul>
              <li>
                <NavLink to="/home">
                  <span className="sidebar-icon"><LuHouse /></span> Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard">
                  <span className="sidebar-icon"><LuLayoutDashboard /></span> Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/my-events">
                  <span className="sidebar-icon"><LuCalendarDays /></span> {isCoordinator ? 'My Hosted Events' : 'My Events'}
                </NavLink>
              </li>
              <li>
                <NavLink to="/create-event">
                  <span className="sidebar-icon"><LuPencilLine /></span> Create Event
                </NavLink>
              </li>

              {/* --- Common Admin/Coordinator Links --- */}
              <li>
                <NavLink to="/admin/manage-posts">
                  <span className="sidebar-icon"><LuMegaphone /></span> Manage Posts
                </NavLink>
              </li>

              {/* --- College Admin ONLY Links --- */}
              {!isCoordinator && (
                <>
                  <li>
                    <NavLink to="/admin/students">
                      <span className="sidebar-icon"><LuUsers /></span> Manage Students
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/departments">
                      <span className="sidebar-icon"><LuLayoutDashboard /></span> Manage Academic Structure
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/clubs">
                      <span className="sidebar-icon"><LuUsers /></span> Manage Clubs
                    </NavLink>
                  </li>
                </>
              )}

              {/* --- Common Links --- */}
              <li>
                <NavLink to="/admin/analytics">
                  <span className="sidebar-icon"><LuChartBar /></span> Analytics
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/account">
                  <span className="sidebar-icon"><LuSettings /></span> Settings
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="sidebar-logout-btn">
                  <span className="sidebar-icon"><LuLogOut /></span> Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;