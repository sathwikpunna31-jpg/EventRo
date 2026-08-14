import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import AnnouncementCard from '../components/AnnouncementCard';
// We can reuse some CSS
import './MyReviewsPage.css'; // Reuses section title styles
import './StudentAnnouncementsPage.css'; // New CSS file

function StudentAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                // Fetch all announcements from the public endpoint
                const { data } = await axios.get(`${API_BASE_URL}/api/announcements`);
                setAnnouncements(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch announcements', error);
                toast.error('Failed to load announcements.');
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    return (
        <div className="my-reviews-page"> {/* Reuse class for layout */}
            <h1 className="section-title">Announcements</h1>

            {loading ? (
                <Loader />
            ) : announcements.length === 0 ? (
                <p className="no-reviews-message">No announcements have been posted yet.</p>
            ) : (
                <div className="announcements-list-page">
                    {announcements.map((announcement) => (
                        <AnnouncementCard key={announcement._id} announcement={announcement} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default StudentAnnouncementsPage;