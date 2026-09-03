import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaRobot,
  FaPaperPlane,
  FaMagic,
  FaCalendarAlt,
  FaTag,
  FaTrashAlt,
  FaChevronDown,
} from 'react-icons/fa';
import API_BASE_URL from '../config';
import AuthContext from '../context/AuthContext';
import './AiConcierge.css';

const QUICK_PROMPTS = [
  '🔥 Hackathons & Tech Events',
  '🎓 Free Workshops this Month',
  '🎉 Cultural Fests & Music',
  '🏆 Events with Cash Prizes',
];

const INITIAL_MESSAGE = {
  sender: 'bot',
  text: "Hello! 👋 I'm **Eventro AI**, your intelligent campus concierge.\n\nAsk me about upcoming hackathons, workshops, fest dates, entry fees, or personalized event recommendations!",
  timestamp: new Date(),
  matchedEvents: [],
};

const AiConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('eventro_ai_chat');
    return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Persist session messages
  useEffect(() => {
    try {
      sessionStorage.setItem('eventro_ai_chat', JSON.stringify(messages));
    } catch (e) {
      console.warn('SessionStorage quota exceeded');
    }
  }, [messages]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMessage = {
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build history payload for RAG context
      const historyPayload = messages.slice(-4).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const collegeStr =
        user?.collegeName ||
        (typeof user?.college === 'string' ? user.college : user?.college?.name) ||
        '';

      const payload = {
        message: messageText,
        history: historyPayload,
        college: collegeStr,
      };

      const res = await axios.post(`${API_BASE_URL}/api/ai/chat`, payload);

      const botMessage = {
        sender: 'bot',
        text: res.data.reply || "Here's what I found for you!",
        matchedEvents: res.data.matchedEvents || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error connecting to AI concierge:', error);
      const errorMessage = {
        sender: 'bot',
        text:
          error.response?.data?.message ||
          "Sorry, I couldn't connect to the AI service right now. Please check if your backend server and Gemini API key are active.",
        matchedEvents: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    sessionStorage.removeItem('eventro_ai_chat');
  };

  const handleEventClick = (eventId) => {
    setIsOpen(false);
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="ai-concierge-root">
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          className="ai-fab-btn"
          onClick={() => setIsOpen(true)}
          title="Ask Eventro AI"
          aria-label="Open Eventro AI Concierge"
        >
          <div className="ai-fab-icon-wrap">
            <FaRobot className="ai-fab-icon" />
            <span className="ai-fab-sparkle">✨</span>
          </div>
          <span className="ai-fab-label">AI Concierge</span>
          <span className="ai-fab-pulse"></span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="ai-chat-window animate-slide-up">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-left">
              <div className="ai-avatar-badge">
                <FaRobot />
              </div>
              <div className="ai-header-titles">
                <h4>Eventro AI</h4>
                <span className="ai-status-indicator">
                  <span className="status-dot"></span> Campus Concierge
                </span>
              </div>
            </div>
            <div className="ai-header-actions">
              <button
                className="ai-header-btn"
                onClick={handleClearChat}
                title="Clear conversation"
              >
                <FaTrashAlt />
              </button>
              <button
                className="ai-header-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
              >
                <FaChevronDown />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="ai-chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`ai-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="ai-msg-avatar">
                    <FaRobot />
                  </div>
                )}
                <div className="ai-bubble-wrap">
                  <div className={`ai-message-bubble ${msg.sender}`}>
                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                  </div>

                  {/* Render interactive Event Cards if matched */}
                  {msg.matchedEvents && msg.matchedEvents.length > 0 && (
                    <div className="ai-event-cards-container">
                      <div className="ai-cards-title">
                        <FaMagic /> Recommended Campus Events
                      </div>
                      <div className="ai-cards-grid">
                        {msg.matchedEvents.map((evt) => (
                          <div
                            key={evt._id}
                            className="ai-event-card"
                            onClick={() => handleEventClick(evt._id)}
                          >
                            {evt.imageUrl && (
                              <img
                                src={evt.imageUrl}
                                alt={evt.title}
                                className="ai-card-img"
                              />
                            )}
                            <div className="ai-card-info">
                              <h5 className="ai-card-title">{evt.title}</h5>
                              <div className="ai-card-meta">
                                <span>
                                  <FaCalendarAlt /> {new Date(evt.date).toLocaleDateString()}
                                </span>
                                <span>
                                  <FaTag /> {evt.category}
                                </span>
                              </div>
                              <div className="ai-card-footer">
                                <span className={`ai-card-badge ${evt.isFree ? 'badge-free' : 'badge-paid'}`}>
                                  {evt.isFree ? 'Free' : `₹${evt.price}`}
                                </span>
                                <button className="ai-card-view-btn">
                                  View Details &rarr;
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Loader Indicator */}
            {loading && (
              <div className="ai-message-row bot-row">
                <div className="ai-msg-avatar">
                  <FaRobot />
                </div>
                <div className="ai-message-bubble bot ai-typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="ai-quick-prompts">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                className="ai-prompt-chip"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="ai-chat-footer">
            <input
              ref={inputRef}
              type="text"
              className="ai-chat-input"
              placeholder="Ask about events, schedules, prizes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="ai-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiConcierge;
