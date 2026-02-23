import React from 'react';
import EventForm from '../components/EventForm'; // We will create this next
import './CreateEventPage.css';

function CreateEventPage() {
  return (
    <div className="create-event-container">
      <div className="form-wrapper">
        <h2>Create a New Event</h2>
        <p>Fill out the details below to post a new event for your college.</p>
        <EventForm />
      </div>
    </div>
  );
}

export default CreateEventPage;