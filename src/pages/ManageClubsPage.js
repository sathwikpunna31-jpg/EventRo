import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { FaUsers } from 'react-icons/fa';
import './ManageClubsPage.css';

function ManageClubsPage() {
    const [clubs, setClubs] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state for creating a new club
    const [newClubName, setNewClubName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newCoordinators, setNewCoordinators] = useState([]);

    // State for editing a club
    const [editingClubId, setEditingClubId] = useState(null);
    const [editClubName, setEditClubName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editCoordinators, setEditCoordinators] = useState([]);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchClubs();
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchClubs = async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL || `https://eventro-backend.onrender.com`}/api/clubs`, config);
            setClubs(data);
        } catch (error) {
            console.error('Failed to fetch clubs:', error);
            toast.error(error.response?.data?.message || 'Failed to load clubs');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        if (!user?.token) return;
        try {
            // Need students to assign as coordinators
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL || `https://eventro-backend.onrender.com`}/api/users/students`, config);
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleCreateClub = async (e) => {
        e.preventDefault();
        if (!newClubName.trim() || !newDescription.trim()) {
            return toast.error("Club name and description are required");
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${process.env.REACT_APP_API_URL || `https://eventro-backend.onrender.com`}/api/clubs`, {
                name: newClubName,
                description: newDescription,
                email: newEmail,
                coordinators: newCoordinators
            }, config);

            toast.success('Club created successfully');
            setNewClubName('');
            setNewDescription('');
            setNewEmail('');
            setNewCoordinators([]);
            fetchClubs();
        } catch (error) {
            console.error("Error creating club:", error);
            toast.error(error.response?.data?.message || 'Failed to create club');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will demote its coordinators back to students.")) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${process.env.REACT_APP_API_URL || `https://eventro-backend.onrender.com`}/api/clubs/${id}`, config);
            toast.success('Club deleted');
            setClubs(clubs.filter(c => c._id !== id));
        } catch (error) {
            console.error('Error deleting club:', error);
            toast.error(error.response?.data?.message || 'Failed to delete club');
        }
    };

    const startEditing = (club) => {
        setEditingClubId(club._id);
        setEditClubName(club.name);
        setEditDescription(club.description);
        setEditEmail(club.email || '');
        setEditCoordinators(club.coordinators.map(c => c._id));
    };

    const cancelEditing = () => {
        setEditingClubId(null);
    };

    const handleUpdateClub = async (e, id) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${process.env.REACT_APP_API_URL || `https://eventro-backend.onrender.com`}/api/clubs/${id}`, {
                name: editClubName,
                description: editDescription,
                email: editEmail,
                coordinators: editCoordinators
            }, config);

            toast.success('Club updated');
            cancelEditing();
            fetchClubs();
        } catch (error) {
            console.error("Error updating club:", error);
            toast.error(error.response?.data?.message || 'Failed to update club');
        }
    };

    const toggleCoordinator = (studentId, isEditing = false) => {
        if (isEditing) {
            setEditCoordinators(prev =>
                prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
            );
        } else {
            setNewCoordinators(prev =>
                prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
            );
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="manage-departments-container">
            <h1 className="section-title">Manage Clubs</h1>
            <p className="subtitle">Create administrative clubs and assign coordinators to run events.</p>

            <div className="admin-content-layout">
                {/* Left Column: List of Clubs */}
                <div className="departments-list-section">
                    <h2>Your College Clubs</h2>
                    {clubs.length === 0 ? (
                        <EmptyState
                            icon={<FaUsers />}
                            title="No Clubs Created Yet"
                            description="Organize your student body by creating clubs. You can assign coordinators to manage them."
                        />
                    ) : (
                        <div className="departments-grid">
                            {clubs.map(club => (
                                <div key={club._id} className="department-card">
                                    {editingClubId === club._id ? (
                                        <form onSubmit={(e) => handleUpdateClub(e, club._id)} className="edit-dept-form">
                                            <input
                                                type="text"
                                                value={editClubName}
                                                onChange={(e) => setEditClubName(e.target.value)}
                                                required
                                                className="form-input"
                                                placeholder="Club Name"
                                            />
                                            <input
                                                type="email"
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                className="form-input"
                                                placeholder="Official Email (Optional)"
                                            />
                                            <textarea
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                required
                                                className="form-input"
                                                placeholder="Description"
                                                rows="3"
                                            />

                                            <div className="coordinator-select-area">
                                                <label>Assign Coordinators:</label>
                                                <div className="student-scroll-list" style={{ minHeight: '60px' }}>
                                                    {students.length === 0 ? (
                                                        <p style={{ color: '#888', fontSize: '0.85rem', margin: '0.5rem' }}>No student accounts found. Ask students to register first.</p>
                                                    ) : (
                                                        students.map(student => (
                                                            <label key={student._id} className="student-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editCoordinators.includes(student._id)}
                                                                    onChange={() => toggleCoordinator(student._id, true)}
                                                                />
                                                                {student.name} ({student.email})
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div className="form-actions" style={{ marginTop: '1rem' }}>
                                                <button type="submit" className="btn-save-sm">Save</button>
                                                <button type="button" onClick={cancelEditing} className="btn-cancel-sm">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="dept-header">
                                                <h3>{club.name}</h3>
                                                <div className="dept-actions">
                                                    <button onClick={() => startEditing(club)} className="btn-edit-icon" title="Edit">✎</button>
                                                    <button onClick={() => handleDelete(club._id)} className="btn-delete-icon" title="Delete">🗑</button>
                                                </div>
                                            </div>
                                            <div className="dept-body">
                                                <p className="club-desc">{club.description.substring(0, 60)}{club.description.length > 60 ? '...' : ''}</p>
                                                <p><strong>Email:</strong> {club.email || <em>None set</em>}</p>
                                                <p><strong>Coordinators:</strong></p>
                                                <ul className="coordinators-list">
                                                    {club.coordinators.length > 0 ? (
                                                        club.coordinators.map(c => <li key={c._id}>{c.name}</li>)
                                                    ) : (
                                                        <li><em>None assigned</em></li>
                                                    )}
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Add New Club */}
                <div className="add-department-section">
                    <div className="add-dept-card">
                        <h2>Create Club</h2>
                        <form onSubmit={handleCreateClub} className="create-dept-form">
                            <div className="form-group">
                                <label>Club Name*</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Coding Club"
                                    className="form-input"
                                    value={newClubName}
                                    onChange={(e) => setNewClubName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Official Email (Optional)</label>
                                <p className="help-text">e.g. coding@college.edu</p>
                                <input
                                    type="email"
                                    placeholder="coding@college.edu"
                                    className="form-input"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description*</label>
                                <textarea
                                    placeholder="What does this club do?"
                                    className="form-input"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    required
                                    rows="4"
                                />
                            </div>

                            <div className="form-group">
                                <label>Assign Initial Coordinators (Optional)</label>
                                <div className="student-scroll-list" style={{ minHeight: '60px' }}>
                                    {students.length === 0 ? (
                                        <p style={{ color: '#888', fontSize: '0.85rem', margin: '0.5rem' }}>No student accounts available to assign.</p>
                                    ) : (
                                        students.map(student => (
                                            <label key={student._id} className="student-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={newCoordinators.includes(student._id)}
                                                    onChange={() => toggleCoordinator(student._id, false)}
                                                />
                                                {student.name}
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="btn-primary-full">Open Club</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageClubsPage;
