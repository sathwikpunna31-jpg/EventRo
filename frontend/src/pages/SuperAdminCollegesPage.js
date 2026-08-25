import API_BASE_URL from '../config';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import './AdminStudentManagementPage.css'; // Reuse table list styles

function SuperAdminCollegesPage() {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const fetchColleges = async () => {
        if (!user?.token) return;
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/api/superadmin/colleges`, config);
            setColleges(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch colleges:', error);
            toast.error("Failed to load colleges list.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchColleges();
    }, [user]);

    const handleApprove = async (id, collegeName) => {
        if (window.confirm(`Are you sure you want to approve ${collegeName}? This will activate their administrator account.`)) {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                await axios.put(`${API_BASE_URL}/api/superadmin/colleges/${id}/approve`, {}, config);
                toast.success(`${collegeName} approved successfully!`);
                fetchColleges();
            } catch (error) {
                console.error('Approve error:', error);
                toast.error(error.response?.data?.message || 'Failed to approve college.');
            }
        }
    };

    const handleSuspend = async (id, collegeName) => {
        if (window.confirm(`Are you sure you want to suspend/reject ${collegeName}? This will block their administrator account.`)) {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                await axios.put(`${API_BASE_URL}/api/superadmin/colleges/${id}/suspend`, {}, config);
                toast.success(`${collegeName} suspended.`);
                fetchColleges();
            } catch (error) {
                console.error('Suspend error:', error);
                toast.error(error.response?.data?.message || 'Failed to suspend college.');
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="student-management-container">
            <div className="management-header">
                <div>
                    <h1>Manage Colleges</h1>
                    <p>Approve new college registrations or manage existing ones.</p>
                </div>
            </div>

            <div className="students-table-wrapper">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>College Name</th>
                            <th>Domain</th>
                            <th>Admin Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {colleges.length > 0 ? (
                            colleges.map((college) => (
                                <tr key={college._id}>
                                    <td style={{ fontWeight: 'bold' }}>{college.name}</td>
                                    <td>{college.domain}</td>
                                    <td>{college.adminEmail}</td>
                                    <td>
                                        <span className={`badge badge-${college.verifiedStatus === 'verified' ? 'success' : college.verifiedStatus === 'pending' ? 'warning' : 'danger'}`}>
                                            {college.verifiedStatus.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {college.verifiedStatus !== 'verified' && (
                                                <button
                                                    onClick={() => handleApprove(college._id, college.name)}
                                                    className="btn-sm"
                                                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {college.verifiedStatus === 'verified' && (
                                                <button
                                                    onClick={() => handleSuspend(college._id, college.name)}
                                                    className="btn-sm"
                                                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                            {college.verifiedStatus === 'pending' && (
                                                <button
                                                    onClick={() => handleSuspend(college._id, college.name)}
                                                    className="btn-sm"
                                                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    No colleges registered on the platform yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SuperAdminCollegesPage;
