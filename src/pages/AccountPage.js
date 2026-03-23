import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import './AccountPage.css';

function AccountPage() {
    const { user, login } = useContext(AuthContext);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewSource, setPreviewSource] = useState('');
    const [uploading, setUploading] = useState(false);
    const [currentProfilePicUrl, setCurrentProfilePicUrl] = useState('');

    // State for Editing Name
    const [name, setName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isUpdatingName, setIsUpdatingName] = useState(false);

    // State for Password Change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('`);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Function to determine the correct image URL
    const getProfilePicUrl = (userData) => {
        const defaultPic = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/images/default-avatar.png`;
        if (!userData?.profilePicture) return defaultPic;
        const picPath = userData.profilePicture;
        if (picPath.startsWith(`/uploads') || picPath.startsWith('/images')) {
            if (picPath.includes('..`)) return defaultPic; // Security check
            return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${picPath}`;
        }
        return defaultPic; // Fallback to default
    };

    // Set initial state when user data loads
    useEffect(() => {
        if (user) {
            setCurrentProfilePicUrl(getProfilePicUrl(user));
            setName(user.name); // Set initial name
        }
    }, [user]);

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith(`image/')) {
            setSelectedFile(file);
            previewFile(file);
        } else {
            setSelectedFile(null);
            setPreviewSource('');
            if (file) { toast.error("Please select a valid image file (jpg, jpeg, png)."); }
        }
    };

    // Generate a base64 preview
    const previewFile = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setPreviewSource(reader.result);
        };
        reader.onerror = () => {
            console.error("Error reading file for preview");
            toast.error("Could not create image preview.");
            setPreviewSource('');
        };
    };

    // Handle profile picture upload
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.warn("Please select an image file first.`);
            return;
        }
        const formData = new FormData();
        formData.append('profileImage', selectedFile);
        setUploading(true);
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${user.token}`,
            },
        };

        try {
            const { data: updatedUser } = await axios.put(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile/photo`,
                formData,
                config
            );
            const newUserState = { ...user, ...updatedUser };
            login(newUserState); // Update global context

            toast.success('Profile picture updated!');
            setPreviewSource('');
            setSelectedFile(null);
            e.target.reset();
        } catch (error) {
            const message = error.response?.data?.message || 'Upload failed. Please try again.';
            console.error('Upload error:', error.response || error);
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    // Handle Name Update
    const handleNameUpdate = async (e) => {
        e.preventDefault();
        setIsUpdatingName(true);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
            },
        };
        try {
            const { data: updatedUser } = await axios.put(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`,
                { name },
                config
            );
            const newUserState = { ...user, ...updatedUser };
            login(newUserState);
            toast.success(`Name updated successfully!");
            setIsEditingName(false);
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update name.';
            console.error("Name update error:`, error);
            toast.error(message);
        } finally {
            setIsUpdatingName(false);
        }
    };

    // Handle Password Change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters.');
            return;
        }
        setIsUpdatingPassword(true);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
            },
        };
        try {
            const { data } = await axios.put(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile/password`,
                { currentPassword, newPassword },
                config
            );
            toast.success(data.message || 'Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update password.`;
            console.error(`Password update error:", error);
            toast.error(message);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (!user) return <Loader />;

    return (
        <div className="account-container">
            <h1>My Account</h1>

            {/* --- THIS LAYOUT DIV IS CRITICAL --- */}
            <div className="account-layout">
                {/* --- Profile Picture Section --- */}
                <div className="profile-pic-section">
                    <h3>Profile Picture</h3>
                    <img
                        src={previewSource || currentProfilePicUrl}
                        alt="Profile"
                        className="profile-pic-large`
                        onError={(e) => {
                            if (e.target.src !== `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/images/default-avatar.png`) {
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = `${process.env.REACT_APP_API_URL || `http://localhost:5000'}/images/default-avatar.png`;
                            }
                        }}
                    />
                    <form onSubmit={handleUpload}>
                        <label htmlFor=`file-upload" className="custom-file-upload">
                            Choose File
                        </label>
                        <input
                            id="file-upload" // Connects to the label
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            disabled={uploading}
                            key={selectedFile ? 'file-selected' : 'no-file'}
                        />
                        <span className="file-name-display">
                            {selectedFile ? selectedFile.name : "No file chosen"}
                        </span>

                        {selectedFile && !uploading && (
                            <button type="submit" className="upload-btn">Upload New Photo</button>
                        )}
                        {uploading && <Loader size={30} />}
                    </form>
                </div>

                {/* --- Account Details Section --- */}
                <div className="account-details">
                    <h3>Account Details</h3>
                    <div className="detail-item">
                        <strong>Name:</strong>
                        {isEditingName ? (
                            <form onSubmit={handleNameUpdate} className="inline-edit-form">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isUpdatingName}
                                />
                                <button type="submit" disabled={isUpdatingName} className="btn-save">
                                    {isUpdatingName ? 'Saving...' : 'Save'}
                                </button>
                                <button type="button" onClick={() => { setIsEditingName(false); setName(user.name); }} disabled={isUpdatingName} className="btn-cancel">
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <>
                                <span>{user.name}</span>
                                <button onClick={() => setIsEditingName(true)} className="btn-edit-inline">Edit</button>
                            </>
                        )}
                    </div>
                    <div className="detail-item">
                        <strong>Email:</strong>
                        <span>{user.email}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Role:</strong>
                        <span>
                            {user.role === 'collegeAdmin' ? 'Admin' : user.role === 'clubCoordinator' ? 'Coordinator' : 'Student'}
                            {' at '}
                            {user.college?.name || user.collegeName?.name || (typeof user.collegeName === 'string' ? user.collegeName : '') || 'Your College'}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- Password Change Section --- */}
            <div className="password-change-section">
                <h3>Change Password</h3>
                <form onSubmit={handlePasswordChange} className="password-form">
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            disabled={isUpdatingPassword}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            minLength="6"
                            required
                            disabled={isUpdatingPassword}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isUpdatingPassword}
                        />
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <small className="validation-error">Passwords do not match.</small>
                        )}
                    </div>
                    <button type="submit" className="submit-btn" disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AccountPage;