import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import AuthContext from './context/AuthContext';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';

// Page Components
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import EventDetailsPage from './pages/EventDetailsPage';
import CreateEventPage from './pages/CreateEventPage';
import DashboardPage from './pages/DashboardPage';
import EditEventPage from './pages/EditEventPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import AccountPage from './pages/AccountPage';
import FeedPage from './pages/FeedPage';
import CreatePostPage from './pages/CreatePostPage';
import EventRegistrationsPage from './pages/EventRegistrationsPage';
import ManagePostsPage from './pages/ManagePostsPage';
import AdminEventsListPage from './pages/AdminEventsListPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import MyReviewsPage from './pages/MyReviewsPage';
import MyQuestionsPage from './pages/MyQuestionsPage';
import SavedEventsPage from './pages/SavedEventsPage';
import EventCalendarPage from './pages/EventCalendarPage';
import PopularEventsPage from './pages/PopularEventsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RegistrationConfirmationPage from './pages/RegistrationConfirmationPage';
import TrackProgressPage from './pages/TrackProgressPage';
import AdminStudentManagementPage from './pages/AdminStudentManagementPage';
import ManageDepartmentsPage from './pages/ManageDepartmentsPage';
import ManageClubsPage from './pages/ManageClubsPage';
import CoordinatorDashboardPage from './pages/CoordinatorDashboardPage';

// Security Components
import AdminRoute from './components/AdminRoute';
import StudentRoute from './components/StudentRoute';
import ProtectedRoute from './components/ProtectedRoute';

// Notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Global Styles
import './styles/App.css';

// Layout for Public URLs (Navbar + Footer)
const PublicLayout = () => (
  <div className="app-container">
    <Navbar />
    <main className="main-content">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Protected Layout Wrapper for /home
const RoleBasedHomeLayout = () => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  
  const role = user.role ? user.role.toLowerCase() : 'student';

  if (role === 'collegeadmin' || role === 'clubcoordinator' || role === 'superadmin') {
     return <AdminLayout />;
  }
  
  // Default to StudentLayout to prevent any redirect loops for unknown roles
  return <StudentLayout />;
};

// Main Application Component
function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* --- Public Routes (Wrapped in PublicLayout) --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/event/:eventId" element={<EventDetailsPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/popular-events" element={<PopularEventsPage />} />
        </Route>

        {/* --- Authentication (No Layout) --- */}
        <Route path="/login" element={<LoginPage />} />

        {/* --- Dynamic Home Route --- */}
        <Route element={<RoleBasedHomeLayout />}>
          <Route path="/home" element={<HomePage />} />
        </Route>

        {/* --- Admin Routes (Wrapped in AdminRoute -> AdminLayout) --- */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            {/* Navigational routes */}
            
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/coordinator-dashboard" element={<CoordinatorDashboardPage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/edit-event/:eventId" element={<EditEventPage />} />
            <Route path="/create-post/:eventId" element={<CreatePostPage />} />
            <Route path="/event/:eventId/registrations" element={<EventRegistrationsPage />} />
            <Route path="/admin/my-events" element={<AdminEventsListPage />} />
            <Route path="/admin/manage-posts" element={<ManagePostsPage />} />
            <Route path="/admin/students" element={<AdminStudentManagementPage />} />
            <Route path="/admin/departments" element={<ManageDepartmentsPage />} />
            <Route path="/admin/clubs" element={<ManageClubsPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/account" element={<AccountPage />} />
          </Route>
        </Route>

        {/* --- Student Routes (Wrapped in StudentRoute -> StudentLayout) --- */}
        <Route element={<StudentRoute />}>
          <Route element={<StudentLayout />}>
            {/* Navigational routes */}

            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/my-registrations" element={<MyRegistrationsPage />} />
            <Route path="/my-reviews" element={<MyReviewsPage />} />
            <Route path="/my-questions" element={<MyQuestionsPage />} />
            <Route path="/saved-events" element={<SavedEventsPage />} />
            <Route path="/student/calendar" element={<EventCalendarPage />} />
            <Route path="/student/account" element={<AccountPage />} />
            <Route path="/registration/:registrationId" element={<RegistrationConfirmationPage />} />
            <Route path="/student/progress" element={<TrackProgressPage />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;