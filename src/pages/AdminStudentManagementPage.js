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

    // New Academic Structure Fields
    const [departmentId, setDepartmentId] = useState('');
    const [year, setYear] = useState('');
    const [section, setSection] = useState('');
    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);

    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { user } = useContext(AuthContext);

    // Fetch students on mount
    useEffect(() => {
        fetchStudents();
        fetchDepartments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchStudents = async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/students`, config);
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
            // toast.error('Failed to load students');
        }
    };

    const fetchDepartments = async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/departments`, config);
            setAvailableDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    // Update available sections and years when department changes
    useEffect(() => {
        if (departmentId) {
            const selectedDept = availableDepartments.find(d => d._id === departmentId);
            setAvailableSections(selectedDept ? selectedDept.sections : []);
            setAvailableYears(selectedDept ? (selectedDept.years || []) : []);
            setSection(''); // Reset section when dept changes
            setYear('');    // Reset year when dept changes
        } else {
            setAvailableSections([]);
            setAvailableYears([]);
            setSection('');
            setYear('');
        }
    }, [departmentId, availableDepartments]);

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            toast.error('Please fill in all required fields');
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
            const payload = {
                name,
                email,
                password,
                department: departmentId || undefined,
                year: year || undefined,
                section: section || undefined
            };

            const { data } = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/create-student`,
                payload,
                config
            );
            toast.success(`Student ${data.name} created successfully!`);

            // Reset form
            setName('');
            setEmail('');
            setPassword('');
            setDepartmentId('');
            setYear('');
            setSection('');

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
        if (!window.confirm('Are you sure you want to delete this student?`)) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/students/${id}`, config);
            toast.success(`Student deleted successfully');
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
                // Expected format: Name, Email, Password, DepartmentId, Section
                // We'll stick to basic fields to keep upload simple, but backend supports dept via API
                const [n, em, pwd] = row.split(',').map(item => item?.trim());
                if (n && em && pwd) return { name: n, email: em, password: pwd };
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
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/students/bulk`,
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
                <p>Add, remove, and categorize student accounts.</p>
            </div>

            <div className="management-grid">
                {/* --- Left Column: Create Student Form --- */}
                <div className="management-card form-card">
                    <h2><FaUserPlus /> Add New Student</h2>
                    <form onSubmit={handleCreateStudent} className="student-form">
                        <div className="form-group">
                            <label>Name *</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                        </div>
                        <div className="form-group">
                            <label>Email *</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@college.edu" required />
                        </div>
                        <div className="form-group">
                            <label>Password *</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******" required />
                        </div>

                        {availableYears.length > 0 && (
                            <div className="form-group">
                                <label>Year (Optional)</label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="styled-select"
                                >
                                    <option value="">-- No Year --</option>
                                    {availableYears.map(yr => (
                                        <option key={yr} value={yr}>{yr}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Department (Optional)</label>
                            <select
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                className="styled-select"
                            >
                                <option value="">-- No Department --</option>
                                {availableDepartments.map(dept => (
                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        {availableSections.length > 0 && (
                            <div className="form-group">
                                <label>Section (Optional)</label>
                                <select
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    className="styled-select"
                                >
                                    <option value="">-- No Section --</option>
                                    {availableSections.map(sec => (
                                        <option key={sec} value={sec}>{sec}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button type="submit" className="btn-create" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="bulk-upload-section">
                        <h3>Bulk Upload (CSV)</h3>
                        <p>Basic Format: Name, Email, Password</p>
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
                                    <th>Department</th>
                                    <th>Year</th>
                                    <th>Section</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map(student => (
                                        <tr key={student._id}>
                                            <td>{student.name}</td>
                                            <td>{student.email}</td>
                                            <td>{student.department ? student.department.name : '-'}</td>
                                            <td>{student.year ? student.year : '-'}</td>
                                            <td>{student.section ? student.section : '-'}</td>
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
                                        <td colSpan="5" className="no-data">No students found.</td>
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
