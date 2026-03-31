import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';
import './ManageDepartmentsPage.css';

function ManageDepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state for creating a new department
    const [newDeptName, setNewDeptName] = useState('');
    const [newSections, setNewSections] = useState('');
    const [newYears, setNewYears] = useState('');

    // State for editing a department
    const [editingDeptId, setEditingDeptId] = useState(null);
    const [editDeptName, setEditDeptName] = useState('');
    const [editSections, setEditSections] = useState('');
    const [editYears, setEditYears] = useState('');

    const { user } = useContext(AuthContext);

    const fetchDepartments = async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL || `https://eventro-backend.onrender.com`}/api/departments`, config);
            setDepartments(data);
        } catch (error) {
            console.error('Failed to fetch academic structure:', error);
            toast.error(error.response?.data?.message || 'Failed to load academic data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        if (!newDeptName.trim()) {
            return toast.error("Department name is required");
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${process.env.REACT_APP_API_URL || `https://eventro-backend.onrender.com`}/api/departments`, {
                name: newDeptName,
                sections: newSections,
                years: newYears
            }, config);

            toast.success("Department created successfully");
            setNewDeptName('');
            setNewSections('');
            setNewYears('');
            fetchDepartments();
        } catch (error) {
            console.error("Error creating department:", error);
            toast.error(error.response?.data?.message || "Failed to create department");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will remove this department from any assigned students.")) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${process.env.REACT_APP_API_URL || `https://eventro-backend.onrender.com`}/api/departments/${id}`, config);
            toast.success("Department deleted");
            setDepartments(departments.filter(d => d._id !== id));
        } catch (error) {
            console.error("Error deleting department:", error);
            toast.error(error.response?.data?.message || "Failed to delete department");
        }
    };

    const startEditing = (dept) => {
        setEditingDeptId(dept._id);
        setEditDeptName(dept.name);
        setEditSections(dept.sections?.join(', ') || '');
        setEditYears(dept.years?.join(', ') || '');
    };

    const cancelEditing = () => {
        setEditingDeptId(null);
        setEditDeptName('');
        setEditSections('');
        setEditYears('');
    };

    const handleUpdateDepartment = async (e, id) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${process.env.REACT_APP_API_URL || `https://eventro-backend.onrender.com`}/api/departments/${id}`, {
                name: editDeptName,
                sections: editSections,
                years: editYears
            }, config);

            toast.success("Department updated");
            cancelEditing();
            fetchDepartments();
        } catch (error) {
            console.error("Error updating department:", error);
            toast.error(error.response?.data?.message || "Failed to update department");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="manage-departments-container">
            <h1 className="section-title">Manage Academic Structure</h1>
            <p className="subtitle">Set up the departments and academic years for your college to organize students.</p>

            <div className="admin-content-layout">
                {/* Left Column: List of Departments */}
                <div className="departments-list-section">
                    <h2>Current Departments</h2>
                    {departments.length === 0 ? (
                        <EmptyState
                            icon={<FaGraduationCap />}
                            title="No Departments Configured"
                            description="Use the form to structure your students into groups like 'CSE', 'EEE', etc. to start."
                        />
                    ) : (
                        <div className="departments-grid">
                            {departments.map(dept => (
                                <div key={dept._id} className="department-card">
                                    {editingDeptId === dept._id ? (
                                        <form onSubmit={(e) => handleUpdateDepartment(e, dept._id)} className="edit-dept-form">
                                            <input
                                                type="text"
                                                value={editDeptName}
                                                onChange={(e) => setEditDeptName(e.target.value)}
                                                required
                                                className="form-input"
                                                placeholder="Department Name"
                                            />
                                            <input
                                                type="text"
                                                value={editSections}
                                                onChange={(e) => setEditSections(e.target.value)}
                                                className="form-input"
                                                placeholder="Sections (comma separated, e.g. A, B, C)"
                                            />
                                            <input
                                                type="text"
                                                value={editYears}
                                                onChange={(e) => setEditYears(e.target.value)}
                                                className="form-input"
                                                style={{ marginTop: '0.8rem' }}
                                                placeholder="Years (comma separated, e.g. 1st Year, 2nd Year)"
                                            />
                                            <div className="form-actions" style={{ marginTop: '0.8rem' }}>
                                                <button type="submit" className="btn-save-sm">Save</button>
                                                <button type="button" onClick={cancelEditing} className="btn-cancel-sm">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="dept-header">
                                                <h3>{dept.name}</h3>
                                                <div className="dept-actions">
                                                    <button onClick={() => startEditing(dept)} className="btn-edit-icon" title="Edit">✎</button>
                                                    <button onClick={() => handleDelete(dept._id)} className="btn-delete-icon" title="Delete">🗑</button>
                                                </div>
                                            </div>
                                            <div className="dept-body">
                                                <p><strong>Sections:</strong> {dept.sections?.length > 0 ? dept.sections.join(', ') : 'None configured'}</p>
                                                <p><strong>Years:</strong> {dept.years?.length > 0 ? dept.years.join(', ') : 'None configured'}</p>
                                                <p className="small-text">ID: {dept._id.substring(0, 8)}...</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Add New Department */}
                <div className="add-department-section">
                    <div className="add-dept-card">
                        <h2>Create Department</h2>
                        <form onSubmit={handleCreateDepartment} className="create-dept-form">
                            <div className="form-group">
                                <label>Department Name*</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Computer Science (CSE)"
                                    className="form-input"
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Sections (Optional)</label>
                                <p className="help-text">Comma separated list (e.g., A, B, C, D)</p>
                                <input
                                    type="text"
                                    placeholder="A, B, C"
                                    className="form-input"
                                    value={newSections}
                                    onChange={(e) => setNewSections(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Years (Optional)</label>
                                <p className="help-text">Comma separated list (e.g., 1st Year, 2nd Year)</p>
                                <input
                                    type="text"
                                    placeholder="1st Year, 2nd Year"
                                    className="form-input"
                                    value={newYears}
                                    onChange={(e) => setNewYears(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn-primary-full">Add Department</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageDepartmentsPage;
