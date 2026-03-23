// src/pages/TrackProgressPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import { Pie } from 'react-chartjs-2'; // We can use a Pie/Doughnut chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import html2pdf from 'html2pdf.js';
import './TrackProgressPage.css'; // New CSS file

ChartJS.register(ArcElement, Tooltip, Legend);

function TrackProgressPage() {
    const [stats, setStats] = useState(null);
    const [allRegistrations, setAllRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchRegistrationStats = async () => {
            if (!user?.token) return;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setLoading(true);
                // Fetch all registrations using the new endpoint that returns full Registration documents
                const { data: registrations } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/myregistrations/all`, config);

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
                setAllRegistrations(registrations);

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

    const handleDownloadCertificate = (registration) => {
        const { event, user: userProfile } = registration;
        // userProfile is not populated in the endpoint, so we use the user context for name
        const studentName = user.name || "Student";
        const courseName = event?.title || "Event";

        // Generate a simple HTML template for the certificate
        const element = document.createElement('div');
        element.innerHTML = `
            <div style="width: 800px; height: 600px; padding: 20px; text-align: center; border: 10px solid #787878; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                <div style="width: 750px; height: 550px; padding: 20px; text-align: center; border: 5px solid #787878;">
                    <span style="font-size: 50px; font-weight: bold; color: #2575fc;">Certificate of Attendance</span>
                    <br><br>
                    <span style="font-size: 25px"><i>This is to certify that</i></span>
                    <br><br>
                    <span style="font-size: 40px"><b>${studentName}</b></span><br/><br/>
                    <span style="font-size: 25px"><i>has successfully attended the event</i></span> <br/><br/>
                    <span style="font-size: 30px; font-weight: bold;">${courseName}</span> <br/><br/>
                    <span style="font-size: 20px">Date: ${new Date(event?.date).toLocaleDateString()}</span><br/><br/>
                    <span style="font-size: 20px">College: ${user.college ? user.college.name : user.collegeName}</span>
                </div>
            </div>
        `;

        const opt = {
            margin: 1,
            filename: `${courseName.replace(/\s+/g, '_')}_Certificate.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
        };

        // Call html2pdf
        html2pdf().from(element).set(opt).save().catch(err => {
            console.error("Certificate Generation Error:", err);
            toast.error("Failed to generate certificate.");
        });
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

                    {/* --- Certificate Gallery --- */}
                    <div className="certificate-gallery">
                        <h2>My Certificates</h2>
                        <p>Download certificates for events you have attended.</p>
                        <div className="certificates-list">
                            {allRegistrations.filter(reg => reg.attended).length === 0 ? (
                                <p>You have not attended any events yet.</p>
                            ) : (
                                allRegistrations.filter(reg => reg.attended).map(reg => (
                                    <div key={reg._id} className="certificate-card" style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{reg.event?.title || 'Unknown Event'}</h4>
                                            <small>{new Date(reg.event?.date).toLocaleDateString()}</small>
                                        </div>
                                        <button
                                            onClick={() => handleDownloadCertificate(reg)}
                                            style={{ padding: '8px 16px', backgroundColor: '#2575fc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Download PDF
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            ) : (
                <p>Could not load your progress data.</p>
            )}
        </div>
    );
}

export default TrackProgressPage;