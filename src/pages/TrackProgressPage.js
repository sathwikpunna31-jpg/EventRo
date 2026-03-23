// src/pages/TrackProgressPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import { Pie } from 'react-chartjs-2'; // We can use a Pie/Doughnut chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './TrackProgressPage.css'; // New CSS file

ChartJS.register(ArcElement, Tooltip, Legend);

function TrackProgressPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchRegistrationStats = async () => {
            if (!user?.token) return;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setLoading(true);
                // We need a new backend endpoint to get *all* registrations
                // Let's modify the 'myregistrations' endpoint to return full data
                // For now, let's create a *new* endpoint for stats
                
                // --- We need a new backend endpoint for this ---
                // Let's build it first.
                
                // --- TEMPORARY ---
                // Let's fetch all registrations and process them
                const { data: registrations } = await axios.get(`https://eventro-backend.onrender.com/api/users/myregistrations/all`, config); // We will build this
                
                let attendedCount = 0;
                let wonCount = 0;
                const totalRegistered = registrations.length;

                registrations.forEach(reg => {
                    if (reg.attended) {
                        attendedCount++;
                    }
                    if (reg.didWin) {
                        wonCount++;
                    }
                });

                const participationEfficiency = totalRegistered > 0 ? (attendedCount / totalRegistered) * 100 : 0;
                const winningEfficiency = attendedCount > 0 ? (wonCount / attendedCount) * 100 : 0;
                
                setStats({
                    totalRegistered,
                    attendedCount,
                    wonCount,
                    participationEfficiency,
                    winningEfficiency,
                });
                
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch stats', error);
                toast.error("Failed to load progress data.");
                setLoading(false);
            }
        };
        fetchRegistrationStats();
    }, [user]);

    // Data for Participation Chart
    const participationChartData = stats ? {
        labels: ['Attended', 'Missed'],
        datasets: [{
            data: [stats.attendedCount, stats.totalRegistered - stats.attendedCount],
            backgroundColor: ['rgba(37, 117, 252, 0.8)', 'rgba(230, 230, 230, 0.8)'],
            borderColor: ['#fff'],
            borderWidth: 2,
        }],
    } : null;

    // Data for Winning Chart
    const winningChartData = stats ? {
        labels: ['Won', 'Attended (No Win)'],
        datasets: [{
            data: [stats.wonCount, stats.attendedCount - stats.wonCount],
            backgroundColor: ['rgba(92, 184, 92, 0.8)', 'rgba(230, 230, 230, 0.8)'],
            borderColor: ['#fff'],
            borderWidth: 2,
        }],
    } : null;
    
    const chartOptions = {
        responsive: true,
        plugins: { legend: { position: 'top' } }
    };

    return (
        <div className="track-progress-page">
            <h1 className="section-title">My Progress</h1>

            {loading ? (
                <Loader />
            ) : stats ? (
                <div className="progress-layout">
                    {/* --- Summary Cards --- */}
                    <div className="summary-cards student-cards">
                        <div className="card">
                            <h3>Total Events Registered</h3>
                            <p className="stat">{stats.totalRegistered}</p>
                        </div>
                        <div className="card">
                            <h3>Events Attended</h3>
                            <p className="stat">{stats.attendedCount}</p>
                        </div>
                        <div className="card">
                            <h3>Events Won</h3>
                            <p className="stat">{stats.wonCount}</p>
                        </div>
                    </div>
                    
                    {/* --- Charts --- */}
                    <div className="progress-charts-grid">
                        <div className="progress-chart-card">
                            <h3>Participation Efficiency</h3>
                            <p className="stat-percent">{stats.participationEfficiency.toFixed(0)}%</p>
                            {stats.totalRegistered > 0 ? (
                                <div className="pie-chart-wrapper-small">
                                    <Pie data={participationChartData} options={chartOptions} />
                                </div>
                            ) : <p>No events registered yet.</p>}
                        </div>

                        <div className="progress-chart-card">
                            <h3>Winning Efficiency</h3>
                            <p className="stat-percent">{stats.winningEfficiency.toFixed(0)}%</p>
                            {stats.attendedCount > 0 ? (
                                <div className="pie-chart-wrapper-small">
                                    <Pie data={winningChartData} options={chartOptions} />
                                </div>
                            ) : <p>No events attended yet.</p>}
                        </div>
                    </div>
                    
                    {/* --- Certificate Gallery (Future) --- */}
                    <div className="certificate-gallery">
                        <h2>My Certificates</h2>
                        <p>This is where your uploaded certificates will appear.</p>
                        {/* We will build the list/gallery here later */}
                    </div>

                </div>
            ) : (
                <p>Could not load your progress data.</p>
            )}
        </div>
    );
}

export default TrackProgressPage;