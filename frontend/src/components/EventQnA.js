import API_BASE_URL from '../config';
import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './EventQnA.css';

function EventQnA({ event, eventId, onUpdate }) {
  const { user } = useContext(AuthContext);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // Check if the current user is the admin who created the event
  const isEventAdmin = user && user._id === event.user;

  // Handle asking a new question
  const handleAsk = async (e) => {
    e.preventDefault();
    const config = {
      headers: { Authorization: `Bearer ${user.token}` },
    };
    try {
      await axios.post(`${API_BASE_URL}/api/events/${eventId}/questions`, { question }, config);
      setQuestion('');
      onUpdate(); // Tell the parent page to refetch data
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Failed to submit question.');
    }
  };

  // Handle submitting an answer
  const handleAnswer = async (questionId) => {
    const config = {
      headers: { Authorization: `Bearer ${user.token}` },
    };
    try {
      await axios.put(`${API_BASE_URL}/api/events/${eventId}/questions/${questionId}`, { answer }, config);
      setAnswer('');
      setEditingQuestionId(null); // Close the answer box
      onUpdate(); // Tell the parent page to refetch data
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer.');
    }
  };

  return (
    <div className="qna-container">
      <h2>Questions & Answers</h2>

      {/* --- Form to Ask a New Question (Show ONLY to students) --- */}
      {/* --- THIS LOGIC IS NOW FIXED --- */}
      {user && user.role === 'student' && (
        <form onSubmit={handleAsk} className="qna-form ask-form">
          <h4>Have a doubt? Ask the event organizer!</h4>
          <textarea
            rows="3"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            required
          ></textarea>
          <button type="submit" className="submit-btn-small">Submit Question</button>
        </form>
      )}

      {/* --- Display List of Q&As --- */}
      <div className="qna-list">
        {event.questions.length === 0 ? (
          <p>No questions have been asked yet.</p>
        ) : (
          event.questions.map((q) => (
            <div key={q._id} className="qna-item">
              <div className="question-part">
                <strong>Q: {q.question}</strong>
                <small>by {q.name} on {new Date(q.createdAt).toLocaleDateString()}</small>
              </div>

              <div className="answer-part">
                {q.answer ? (
                  <>
                    <strong>A: </strong> {q.answer}
                  </>
                ) : isEventAdmin ? (
                  // If no answer, and user is the admin, show answer form
                  <button
                    onClick={() => {
                      setEditingQuestionId(q._id);
                      setAnswer(''); // Clear answer box
                    }}
                    className="btn-answer"
                  >
                    Answer
                  </button>
                ) : (
                  <small>No answer yet.</small>
                )}
              </div>

              {/* --- Inline Answer Form (for Admin) --- */}
              {isEventAdmin && editingQuestionId === q._id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAnswer(q._id);
                  }}
                  className="qna-form answer-form"
                >
                  <textarea
                    rows="2"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    required
                  ></textarea>
                  <button type="submit" className="submit-btn-small">Post Answer</button>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EventQnA;