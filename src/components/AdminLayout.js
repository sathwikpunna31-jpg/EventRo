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
  LuUsers,
  LuBuilding2,
  LuSchool
} from "react-icons/lu";
import './AdminLayout.css';

function AdminLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <h2 className="sidebar-brand">EVENTRO</h2>
          <nav className="sidebar-nav">
            <ul>
              <li>
                <NavLink to="/">
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
                  <span className="sidebar-icon"><LuCalendarDays /></span> My Events
                </NavLink>
              </li>
              <li>
                <NavLink to="/create-event">
                  <span className="sidebar-icon"><LuPencilLine /></span> Create Event
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/manage-posts">
                  <span className="sidebar-icon"><LuMegaphone /></span> Manage Posts
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/students">
                  <span className="sidebar-icon"><LuUsers /></span> Manage Students
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/clubs">
                  <span className="sidebar-icon"><LuSchool /></span> Manage Clubs
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/departments">
                  <span className="sidebar-icon"><LuBuilding2 /></span> Departments
                </NavLink>
              </li>
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
            </ul>
          </nav>
        </div>

        <button onClick={handleLogout} className="sidebar-logout-btn">
          <span className="sidebar-icon"><LuLogOut /></span> Logout
        </button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;