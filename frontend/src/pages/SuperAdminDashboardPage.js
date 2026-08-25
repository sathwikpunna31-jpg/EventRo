import API_BASE_URL from '../config';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import { LuBuilding2, LuCalendarDays, LuUsers, LuTrendingUp, LuGraduationCap } from 'react-icons/lu';
import './DashboardPage.css'; // Reuse dashboard styles for layout

function SuperAdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.token) return;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_BASE_URL}/api/superadmin/stats`, config);
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
                toast.error("Failed to load platform stats.");
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    if (loading) return <Loader />;

    return (
        <div className="dashboard-page-container">
            <header className="dashboard-header">
                <div>
                    <h1>Platform Control Center 🌐</h1>
                    <p>Welcome back, Eventro Super Admin. Here is the global system health overview.</p>
                </div>
            </header>

            <div className="summary-cards">
                <div className="card summary-card">
                    <div className="card-icon blue"><LuBuilding2 /></div>
                    <div className="card-info">
                        <h3>Registered Colleges</h3>
                        <p className="stat">{stats?.totalColleges || 0}</p>
                    </div>
                </div>

                <div className="card summary-card">
                    <div className="card-icon purple"><LuCalendarDays /></div>
                    <div className="card-info">
                        <h3>Global Events</h3>
                        <p className="stat">{stats?.totalEvents || 0}</p>
                    </div>
                </div>

                <div className="card summary-card">
                    <div className="card-icon amber"><LuUsers /></div>
                    <div className="card-info">
                        <h3>Total Students</h3>
                        <p className="stat">{stats?.totalStudents || 0}</p>
                    </div>
                </div>
            </div>

            <div className="summary-cards" style={{ marginTop: '1.5rem' }}>
                <div className="card summary-card">
                    <div className="card-icon blue" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}><LuGraduationCap /></div>
                    <div className="card-info">
                        <h3>Club Coordinators</h3>
                        <p className="stat">{stats?.totalCoordinators || 0}</p>
                    </div>
                </div>

                <div className="card summary-card">
                    <div className="card-icon purple" style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#fb923c' }}><LuTrendingUp /></div>
                    <div className="card-info">
                        <h3>College Admins</h3>
                        <p className="stat">{stats?.totalAdmins || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SuperAdminDashboardPage;
