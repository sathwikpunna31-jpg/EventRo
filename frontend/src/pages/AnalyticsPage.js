import React from 'react';

function AnalyticsPage() {
  return (
    <div className="admin-page-container">
      <h1>Analytics & Reports</h1>
      <p>This page will show advanced charts and allow you to download reports.</p>
      
      <div style={{ marginTop: '2rem', fontStyle: 'italic', color: '#666' }}>
        <p><strong>Coming Soon:</strong></p>
        <ul>
          <li>Registrations over time (line chart)</li>
          <li>Event popularity by category (pie chart)</li>
          <li>Download event registration lists (CSV/Excel)</li>
        </ul>
      </div>
    </div>
  );
}

export default AnalyticsPage;