import React, { useContext } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { 
  LuLayoutDashboard, 
  LuSettings,
  LuLogOut,
  LuHouse,
  LuTicket,
  LuHeart,
  LuCalendar,
  LuStar,
  LuCircleHelp,
  LuTrendingUp // <-- New Icon
} from "react-icons/lu";
import './StudentLayout.css';

function StudentLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="student-layout">
      <aside className="student-sidebar">
        <div>
          <div className="sidebar-brand-student" style={{ padding: '0', borderBottom: 'none', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img src="/logo.jpg.png" alt="Eventro Logo" style={{ width: '100%', maxWidth: '160px' }} />
          </div>
          <Link to="/student/home" className="sidebar-back-link-student">🏠 Home</Link>
          <nav>
            <ul>
              <li><NavLink to="/student/dashboard"><span className="sidebar-icon"><LuLayoutDashboard /></span> Dashboard</NavLink></li>
              {/* --- ADD THIS LINK --- */}
              <li>
                <NavLink to="/student/progress">
                  <span className="sidebar-icon"><LuTrendingUp /></span> Track Progress
                </NavLink>
              </li>
              <li><NavLink to="/my-registrations"><span className="sidebar-icon"><LuTicket /></span> My Registrations</NavLink></li>
              <li><NavLink to="/saved-events"><span className="sidebar-icon"><LuHeart /></span> Saved Events</NavLink></li>
              <li><NavLink to="/student/calendar"><span className="sidebar-icon"><LuCalendar /></span> Event Calendar</NavLink></li>
              <li><NavLink to="/my-reviews"><span className="sidebar-icon"><LuStar /></span> My Reviews</NavLink></li>
              <li><NavLink to="/my-questions"><span className="sidebar-icon"><LuCircleHelp /></span> My Questions</NavLink></li>
              <li><NavLink to="/student/account"><span className="sidebar-icon"><LuSettings /></span> My Account</NavLink></li>
              <li>
                <button onClick={handleLogout} className="sidebar-logout-btn" style={{ width: '100%', marginTop: '0.5rem' }}>
                  <span className="sidebar-icon"><LuLogOut /></span> Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="student-content">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;