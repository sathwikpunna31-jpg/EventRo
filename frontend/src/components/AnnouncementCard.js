import React from 'react';
import './AnnouncementCard.css';

function AnnouncementCard({ announcement }) {
  return (
    <div className="announcement-card">
      <h4>{announcement.title}</h4>
      <p>{announcement.content}</p>
      <small>Posted by {announcement.user.name} on {new Date(announcement.createdAt).toLocaleDateString()}</small>
    </div>
  );
}

export default AnnouncementCard;