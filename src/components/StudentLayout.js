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
          <h2 className="sidebar-brand-student">EVENTRO</h2>
          <Link to="/" className="sidebar-back-link-student">🏠 Home</Link>
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
            </ul>
          </nav>
        </div>

        <button onClick={handleLogout} className="sidebar-logout-btn">
          <span className="sidebar-icon"><LuLogOut /></span> Logout
        </button>
      </aside>
      <main className="student-content">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;