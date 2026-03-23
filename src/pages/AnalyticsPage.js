import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.token) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        setLoading(true);
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/analytics/college`, config);
        setAnalytics(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
        toast.error('Failed to load analytics data.');
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading) return <Loader />;

  // Prepare Data for Charts
  const popularEventsLabels = analytics?.popularEvents?.map(e => e.title) || [];
  const popularEventsData = analytics?.popularEvents?.map(e => e.registrations) || [];

  const barChartData = {
    labels: popularEventsLabels,
    datasets: [
      {
        label: 'Registrations',
        data: popularEventsData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ['Attended', 'Registered but Missed'],
    datasets: [
      {
        data: [
          analytics?.attendedRegistrations || 0,
          (analytics?.totalRegistrations || 0) - (analytics?.attendedRegistrations || 0)
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="admin-page-container" style={{ padding: '20px' }}>
      <h1>Analytics & Reports</h1>
      <p>Overview of your college's event performance.</p>

      {analytics ? (
        <>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Total Events</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{analytics.totalEvents}</p>
            </div>
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Total Registrations</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{analytics.totalRegistrations}</p>
            </div>
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Average Turnout</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{analytics.averageTurnout}%</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2', minWidth: '400px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>Most Popular Events</h3>
              <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>

            <div style={{ flex: '1', minWidth: '300px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>Attendance Breakdown</h3>
              <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>No analytics data available yet.</p>
      )}

    </div>
  );
}

export default AnalyticsPage;