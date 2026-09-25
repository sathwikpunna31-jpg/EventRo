import API_BASE_URL from '../config';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import { FaUniversity, FaTrashAlt, FaCheck, FaBan, FaSearch, FaEnvelope, FaGlobe } from 'react-icons/fa';
import './SuperAdminCollegesPage.css';

function SuperAdminCollegesPage() {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const { user } = useContext(AuthContext);

    const fetchColleges = useCallback(async () => {
        if (!user?.token) return;
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/api/superadmin/colleges`, config);
            setColleges(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch colleges:', error);
            toast.error("Failed to load colleges list.");
            setLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchColleges();
    }, [fetchColleges]);

    const handleApprove = async (id, collegeName) => {
        if (window.confirm(`Are you sure you want to approve ${collegeName}? This will activate their administrator account.`)) {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setActionLoadingId(id);
                await axios.put(`${API_BASE_URL}/api/superadmin/colleges/${id}/approve`, {}, config);
                toast.success(`${collegeName} approved successfully!`);
                setColleges(prev => prev.map(c => c._id === id ? { ...c, verifiedStatus: 'verified' } : c));
                fetchColleges();
            } catch (error) {
                console.error('Approve error:', error);
                toast.error(error.response?.data?.message || 'Failed to approve college.');
            } finally {
                setActionLoadingId(null);
            }
        }
    };

    const handleSuspend = async (id, collegeName) => {
        if (window.confirm(`Are you sure you want to suspend/reject ${collegeName}? This will block their administrator account.`)) {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setActionLoadingId(id);
                await axios.put(`${API_BASE_URL}/api/superadmin/colleges/${id}/suspend`, {}, config);
                toast.success(`${collegeName} suspended.`);
                setColleges(prev => prev.map(c => c._id === id ? { ...c, verifiedStatus: 'rejected' } : c));
                fetchColleges();
            } catch (error) {
                console.error('Suspend error:', error);
                toast.error(error.response?.data?.message || 'Failed to suspend college.');
            } finally {
                setActionLoadingId(null);
            }
        }
    };

    const handleDeleteCollege = async (id, collegeName) => {
        const confirmText = `Are you sure you want to delete this college? This action cannot be undone.\n\nCollege: ${collegeName}`;
        if (window.confirm(confirmText)) {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setActionLoadingId(id);
                const res = await axios.delete(`${API_BASE_URL}/api/superadmin/colleges/${id}`, config);
                // Optimistically update list without manual page refresh
                setColleges(prev => prev.filter(c => c._id !== id));
                toast.success(res.data?.message || `College "${collegeName}" deleted successfully.`);
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(error.response?.data?.message || 'Failed to delete college.');
                fetchColleges();
            } finally {
                setActionLoadingId(null);
            }
        }
    };

    // Filter colleges by name, domain, or admin email
    const filteredColleges = colleges.filter(college => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        const name = (college.name || '').toLowerCase();
        const domain = (college.domain || '').toLowerCase();
        const email = (college.adminEmail || '').toLowerCase();
        return name.includes(term) || domain.includes(term) || email.includes(term);
    });

    if (loading) return <Loader />;

    return (
        <div className="colleges-management-container">
            {/* Header Section */}
            <div className="colleges-header">
                <div className="colleges-header-text">
                    <h1>
                        <FaUniversity style={{ color: 'var(--primary-color, #6366f1)' }} />
                        Manage Colleges
                    </h1>
                    <p>Approve new college registrations, oversee campus domains, and manage institutional records.</p>
                </div>
                <div className="colleges-header-stats">
                    <span className="stat-pill">
                        Total Colleges <span className="stat-pill-number">{colleges.length}</span>
                    </span>
                </div>
            </div>

            {/* Search Toolbar */}
            <div className="colleges-toolbar">
                <div className="colleges-search-box">
                    <FaSearch className="colleges-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by college, domain, or admin..."
                        className="colleges-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Card */}
            <div className="colleges-card">
                <div className="colleges-table-responsive">
                    <table className="colleges-table">
                        <thead>
                            <tr>
                                <th>College Name</th>
                                <th>Domain</th>
                                <th>Admin Email</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredColleges.length > 0 ? (
                                filteredColleges.map((college) => {
                                    const isRowLoading = actionLoadingId === college._id;
                                    const isVerified = college.verifiedStatus === 'verified';
                                    const isPending = college.verifiedStatus === 'pending';

                                    return (
                                        <tr key={college._id}>
                                            {/* College Name */}
                                            <td>
                                                <div className="col-college-info">
                                                    <div className="college-avatar-icon">
                                                        <FaUniversity />
                                                    </div>
                                                    <span className="college-name-text">{college.name}</span>
                                                </div>
                                            </td>

                                            {/* Domain */}
                                            <td>
                                                <span className="domain-chip">
                                                    <FaGlobe style={{ fontSize: '0.75rem', opacity: 0.6 }} />
                                                    {college.domain}
                                                </span>
                                            </td>

                                            {/* Admin Email */}
                                            <td>
                                                <div className="email-cell" title={college.adminEmail}>
                                                    <FaEnvelope className="email-icon" />
                                                    <span>{college.adminEmail}</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span className={`status-pill status-${isVerified ? 'verified' : isPending ? 'pending' : 'rejected'}`}>
                                                    <span className="status-dot"></span>
                                                    {college.verifiedStatus ? college.verifiedStatus.toUpperCase() : 'PENDING'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                                <div className="college-actions-group" style={{ justifyContent: 'flex-end' }}>
                                                    {/* Approve Button */}
                                                    {!isVerified && (
                                                        <button
                                                            onClick={() => handleApprove(college._id, college.name)}
                                                            className="btn-action btn-approve"
                                                            disabled={isRowLoading}
                                                            title="Approve college & administrator"
                                                        >
                                                            <FaCheck />
                                                            <span>Approve</span>
                                                        </button>
                                                    )}

                                                    {/* Suspend Button */}
                                                    {isVerified && (
                                                        <button
                                                            onClick={() => handleSuspend(college._id, college.name)}
                                                            className="btn-action btn-suspend"
                                                            disabled={isRowLoading}
                                                            title="Suspend college"
                                                        >
                                                            <FaBan />
                                                            <span>Suspend</span>
                                                        </button>
                                                    )}

                                                    {/* Reject Button (for pending status) */}
                                                    {isPending && (
                                                        <button
                                                            onClick={() => handleSuspend(college._id, college.name)}
                                                            className="btn-action btn-reject"
                                                            disabled={isRowLoading}
                                                            title="Reject registration"
                                                        >
                                                            <FaBan />
                                                            <span>Reject</span>
                                                        </button>
                                                    )}

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => handleDeleteCollege(college._id, college.name)}
                                                        className="btn-action btn-delete-college"
                                                        disabled={isRowLoading}
                                                        title="Delete college from database"
                                                    >
                                                        {isRowLoading ? (
                                                            <>
                                                                <span className="mini-spinner"></span>
                                                                <span>Deleting...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaTrashAlt />
                                                                <span>Delete</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5">
                                        <div className="colleges-empty-state">
                                            <div className="empty-icon-wrap">
                                                <FaUniversity />
                                            </div>
                                            <h3>{searchTerm ? 'No matching colleges found' : 'No colleges registered yet'}</h3>
                                            <p>
                                                {searchTerm
                                                    ? `No colleges matched "${searchTerm}". Try a different keyword.`
                                                    : 'When colleges register on EventRo, they will appear here for verification.'}
                                            </p>
                                        </div>
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

export default SuperAdminCollegesPage;
