import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import './RegistrationConfirmationPage.css`; // New CSS file

function RegistrationConfirmationPage() {
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const { registrationId } = useParams();
    const { user } = useContext(AuthContext);
    const ticketRef = useRef(); // Ref for the HTML element to download

    useEffect(() => {
        const fetchRegistration = async () => {
            if (!user?.token) return;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setLoading(true);
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/registrations/${registrationId}`, config);
                setRegistration(data);
                setLoading(false);
            } catch (error) {
                console.error(`Failed to fetch registration', error);
                setLoading(false);
            }
        };
        fetchRegistration();
    }, [registrationId, user]);

    const handleDownload = () => {
        const element = ticketRef.current;
        const eventTitle = registration?.event?.title || 'event';
        const userName = registration?.user?.name || 'user';
        const filename = `${userName.replace(/ /g, '_')}_${eventTitle.replace(/ /g, '_')}_ticket.pdf`;

        const opt = {
            margin:       0.5,
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        // Use html2pdf to save the element
        html2pdf().from(element).set(opt).save();
    };

    const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    if (loading) {
        return <div className="ticket-page-container"><Loader size={80} /></div>;
    }

    if (!registration) {
        return (
            <div className="ticket-page-container">
                <h1>Registration Not Found</h1>
                <p>We couldn't find the details for this registration.</p>
                <Link to="/my-registrations">Go to My Registrations</Link>
            </div>
        );
    }

    const { event, user: regUser, phoneNumber, collegeName, yearOfStudy } = registration;

    return (
        <div className="ticket-page-container">
            <h1>Registration Confirmed!</h1>
            <p>You are officially registered. You can download this ticket for your records.</p>
            
            {/* --- The Ticket --- */}
            <div className="ticket-wrapper" ref={ticketRef}>
                <div className="ticket-header">
                    <img src={event.imageUrl} alt={event.title} className="ticket-event-image" />
                    <h2>{event.title}</h2>
                    <p>{event.college}</p>
                </div>
                <div className="ticket-body">
                    <div className="ticket-section">
                        <h4>Attendee Details</h4>
                        <p><strong>Name:</strong> {regUser.name}</p>
                        <p><strong>Email:</strong> {regUser.email}</p>
                        <p><strong>Phone:</strong> {phoneNumber}</p>
                        <p><strong>College:</strong> {collegeName}</p>
                        {yearOfStudy && <p><strong>Year:</strong> {yearOfStudy}</p>}
                    </div>
                    <div className="ticket-section">
                        <h4>Event Details</h4>
                        <p><strong>Date:</strong> {formatDate(event.date)}</p>
                        <p><strong>Registration ID:</strong> {registration._id}</p>
                    </div>
                </div>
                <div className="ticket-footer">
                    <p>Thank you for registering with EVENTRO!</p>
                </div>
            </div>
            
            <button onClick={handleDownload} className="btn-download-ticket">
                Download as PDF
            </button>
        </div>
    );
}

export default RegistrationConfirmationPage;