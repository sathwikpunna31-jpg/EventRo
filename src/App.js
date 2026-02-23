import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
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
          {/* Note: Any generic protected routes that need Navbar could go here too, wrapped in ProtectedRoute */}
        </Route>

        {/* --- Authentication (No Layout) --- */}
        <Route path="/login" element={<LoginPage />} />

        {/* --- Admin Routes (Wrapped in AdminRoute -> AdminLayout) --- */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/edit-event/:eventId" element={<EditEventPage />} />
            <Route path="/create-post/:eventId" element={<CreatePostPage />} />
            <Route path="/event/:eventId/registrations" element={<EventRegistrationsPage />} />
            <Route path="/admin/my-events" element={<AdminEventsListPage />} />
            <Route path="/admin/manage-posts" element={<ManagePostsPage />} />
            <Route path="/admin/students" element={<AdminStudentManagementPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/account" element={<AccountPage />} />
          </Route>
        </Route>

        {/* --- Student Routes (Wrapped in StudentRoute -> StudentLayout) --- */}
        <Route element={<StudentRoute />}>
          <Route element={<StudentLayout />}>
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

        {/* Fallback for 404s (Optional) */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}

      </Routes>
    </Router>
  );
}

export default App;