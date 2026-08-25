import API_BASE_URL from '../config';
// src/pages/AnalyticsPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import { Bar, Doughnut } from 'react-chartjs-2';
import { LuDownload, LuCalendarDays, LuUsers } from 'react-icons/lu';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './DashboardPage.css'; // Reuse dashboard metrics styles
import './AdminStudentManagementPage.css'; // Reuse table list styles

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function AnalyticsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.token) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/api/events/myevents`, config);
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch analytics events:', error);
        toast.error('Failed to load analytics data.');
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  const handleDownloadCSV = async (eventId, eventTitle) => {
    const config = {
      headers: { Authorization: `Bearer ${user.token}` },
      responseType: 'blob'
    };
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/${eventId}/registrations/download`, config);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventTitle.replace(/\s+/g, '_')}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Downloaded registrations for ${eventTitle}!`);
    } catch (error) {
      console.error('CSV download error:', error);
      toast.error('Failed to download registrations list.');
    }
  };

  if (loading) return <Loader />;

  // Overview metrics
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, event) => sum + (event.registrationCount || 0), 0);

  // Chart 1: Registrations per event (Bar Chart)
  const barData = {
    labels: events.map(e => e.title),
    datasets: [
      {
        label: 'Registrations',
        data: events.map(e => e.registrationCount || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.65)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Registrations per Event', color: '#fff', font: { size: 14 } }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: 'rgba(255,255,255,0.6)' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      x: {
        ticks: { color: 'rgba(255,255,255,0.6)' },
        grid: { display: false }
      }
    }
  };

  // Chart 2: Category distribution (Doughnut Chart)
  const categoryCounts = events.reduce((acc, event) => {
    const cat = event.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (event.registrationCount || 0);
    return acc;
  }, {});

  const categories = Object.keys(categoryCounts);
  const doughnutData = {
    labels: categories,
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',  // Indigo
          'rgba(168, 85, 247, 0.7)',  // Purple
          'rgba(236, 72, 153, 0.7)',  // Pink
          'rgba(249, 115, 22, 0.7)',  // Orange
          'rgba(16, 185, 129, 0.7)',  // Emerald
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { color: '#fff' } },
      title: { display: true, text: 'Popularity by Category', color: '#fff', font: { size: 14 } }
    }
  };

  return (
    <div className="dashboard-page-container">
      <header className="dashboard-header">
        <div>
          <h1>Analytics & Reports 📈</h1>
          <p>Analyze registrations and download registration reports for your college.</p>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="summary-cards" style={{ marginBottom: '2rem' }}>
        <div className="card summary-card">
          <div className="card-icon blue"><LuCalendarDays /></div>
          <div className="card-info">
            <h3>Total Events</h3>
            <p className="stat">{totalEvents}</p>
          </div>
        </div>

        <div className="card summary-card">
          <div className="card-icon purple"><LuUsers /></div>
          <div className="card-info">
            <h3>Total Registrations</h3>
            <p className="stat">{totalRegistrations}</p>
          </div>
        </div>
      </div>

      {/* Chart Grid */}
      {events.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ background: 'var(--glass-bg)', border: 'var(--glass-border)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-glow)' }}>
            <Bar data={barData} options={barOptions} />
          </div>
          <div style={{ background: 'var(--glass-bg)', border: 'var(--glass-border)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '90%' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      ) : (
        <p style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-secondary)' }}>No event data available to plot charts.</p>
      )}

      {/* Registration Reports Table */}
      <div className="admin-student-management-container" style={{ padding: 0 }}>
        <h2>Download Event Reports</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Select an event below to download the complete student registrations list in CSV format.
        </p>

        <div className="student-table-container" style={{ boxShadow: 'var(--shadow-glow)', border: 'var(--glass-border)' }}>
          <table className="student-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Category</th>
                <th>Event Date</th>
                <th>Registrations</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event._id}>
                    <td style={{ fontWeight: 'bold' }}>{event.title}</td>
                    <td>{event.category}</td>
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-success" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-color)' }}>
                        {event.registrationCount || 0}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDownloadCSV(event._id, event.title)}
                        disabled={!event.registrationCount}
                        className="btn-sm"
                        style={{
                          background: event.registrationCount ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                          color: event.registrationCount ? '#fff' : 'rgba(255,255,255,0.3)',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: event.registrationCount ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 'bold',
                          transition: 'all 0.2s'
                        }}
                      >
                        <LuDownload size={14} /> CSV
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    No events found. Create an event first to see reports!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;