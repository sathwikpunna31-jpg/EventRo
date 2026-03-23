import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaSearch, FaFileUpload, FaUserPlus } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import './AdminStudentManagementPage.css';

function AdminStudentManagementPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { user } = useContext(AuthContext);

    // Fetch students on mount
    useEffect(() => {
        fetchStudents();
    }, [user]);

    const fetchStudents = async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`https://eventro-backend.onrender.com/api/users/students`, config);
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
            // toast.error('Failed to load students');
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
            },
        };

        try {
            const { data } = await axios.post(
                `https://eventro-backend.onrender.com/api/users/create-student`,
                { name, email, password },
                config
            );
            toast.success(`Student ${data.name} created successfully!`);
            setName('');
            setEmail('');
            setPassword('');
            fetchStudents(); // Refresh list
        } catch (error) {
            console.error('Error creating student:', error);
            const message = error.response?.data?.message || 'Failed to create student';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`https://eventro-backend.onrender.com/api/users/students/${id}`, config);
            toast.success('Student deleted successfully');
            setStudents(students.filter(student => student._id !== id));
        } catch (error) {
            console.error('Error deleting student:', error);
            toast.error('Failed to delete student');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const rows = text.split('\n').slice(1); // Skip header
            const parsedStudents = rows.map(row => {
                const [name, email, password] = row.split(',').map(item => item?.trim());
                if (name && email && password) return { name, email, password };
                return null;
            }).filter(item => item !== null);

            if (parsedStudents.length === 0) {
                toast.error('No valid students found in CSV');
                return;
            }

            if (window.confirm(`Found ${parsedStudents.length} students. Upload now?`)) {
                await uploadBulkStudents(parsedStudents);
            }
        };
        reader.readAsText(file);
    };

    const uploadBulkStudents = async (studentsData) => {
        setUploading(true);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
            },
        };

        try {
            const { data } = await axios.post(
                `https://eventro-backend.onrender.com/api/users/students/bulk`,
                { students: studentsData },
                config
            );
            toast.success(data.message);
            if (data.errors && data.errors.length > 0) {
                toast.warning(`${data.errors.length} students failed to upload (duplicates/errors).`);
            }
            fetchStudents();
        } catch (error) {
            console.error('Error uploading bulk students:', error);
            toast.error('Failed to upload students');
        } finally {
            setUploading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-student-management-container">
            <div className="management-header">
                <h1>Manage Students</h1>
                <p>Add, remove, and manage student accounts for <strong>{user?.collegeName || 'your college'}</strong>.</p>
            </div>

            <div className="management-grid">
                {/* --- Left Column: Create Student Form --- */}
                <div className="management-card form-card">
                    <h2><FaUserPlus /> Add New Student</h2>
                    <form onSubmit={handleCreateStudent} className="student-form">
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@college.edu" required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******" required />
                        </div>
                        <button type="submit" className="btn-create" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="bulk-upload-section">
                        <h3>Bulk Upload (CSV)</h3>
                        <p>Format: Name, Email, Password</p>
                        <label className="btn-upload">
                            <FaFileUpload /> Upload CSV
                            <input type="file" accept=".csv" onChange={handleFileUpload} hidden />
                        </label>
                        {uploading && <p className="uploading-text">Uploading...</p>}
                    </div>
                </div>

                {/* --- Right Column: Student List --- */}
                <div className="management-card list-card">
                    <div className="list-header">
                        <h2>Student List ({filteredStudents.length})</h2>
                        <div className="search-box">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="student-table-container">
                        <table className="student-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map(student => (
                                        <tr key={student._id}>
                                            <td>{student.name}</td>
                                            <td>{student.email}</td>
                                            <td>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteStudent(student._id)}
                                                    title="Delete Student"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="no-data">No students found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminStudentManagementPage;
