// src/pages/MyQuestionsPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
// Reuse QnA item styles or create specific ones
import '../components/EventQnA.css'; // Reusing QnA item styles
import './MyQuestionsPage.css'; // Add new CSS file

function MyQuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchMyQuestions = async () => {
            if (!user?.token) return;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setLoading(true);
                const { data } = await axios.get(`\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/myquestions`, config);
                setQuestions(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch questions', error);
                toast.error("Failed to load your questions.");
                setLoading(false);
            }
        };
        fetchMyQuestions();
    }, [user]);

     const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString();

    return (
        <div className="my-questions-page"> {/* Use specific class */}
            <h1 className="section-title">My Questions</h1>

            {loading ? (
                <Loader />
            ) : questions.length === 0 ? (
                <p className="no-questions-message">You haven't asked any questions yet.</p>
            ) : (
                <div className="qna-list"> {/* Reuse class from EventQnA.css */}
                    {questions.map((q) => (
                        <div key={q.questionId} className="qna-item my-question-item"> {/* Add specific class */}
                           <div className="question-part">
                                <strong>Q: {q.question}</strong>
                                <small>Asked on {formatDate(q.askedDate)} for event: <Link to={`/event/${q.eventId}#qna`}>{q.eventTitle}</Link></small>
                           </div>

                           <div className="answer-part">
                                {q.answer ? (
                                    <>
                                        <strong>A: </strong> {q.answer}
                                    </>
                                ) : (
                                    <small>Not answered yet.</small>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyQuestionsPage;