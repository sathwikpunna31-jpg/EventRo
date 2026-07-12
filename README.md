# Eventro - Campus Event Management System

![Eventro Platform](https://event-ro.vercel.app/)
> *Note: Replace the placeholder above with a real screenshot of your dashboard!*

Eventro is a comprehensive MERN-stack application designed to streamline event management for educational institutions. It facilitates seamless interaction between administrators (colleges) and students, handling everything from event creation and promotion to registration and analytics.

## 🚀 Features

### for Administrators
*   **Event Management**: Create, edit, and manage campus events with rich details.
*   **Analytics Dashboard**: Visual insights into registrations, popular events, and student engagement.
*   **Student Management**: Manage student accounts and view registration histories.
*   **Content Moderation**: oversee reviews and Q&A sections.
*   **Announcements**: Broadcast updates to the student body.

### for Students
*   **Personalized Dashboard**: Track registered events, saved interests, and upcoming schedules.
*   **Discovery Feed**: Browse events via a dynamic, social-media style feed.
*   **Interactive Calendar**: View upcoming deadlines and events in a calendar view.
*   **Engagement**: Rate events, ask questions, and share feedback.
*   **Progress Tracking**: Monitor participation and achievements.

## 🛠️ Tech Stack

*   **Frontend**: React (v19), React Router v7, Context API, Chart.js, CSS3 (Custom Design).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose ODM).
*   **Authentication**: JWT (JSON Web Tokens) & Bcrypt.
*   **Utilities**: Multer (File Uploads), Moment.js (Date Handling).

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v14+)
*   MongoDB (Local or Atlas URI)

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/yourusername/eventro.git
cd eventro_dev
\`\`\`

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
\`\`\`bash
cd backend
npm install
\`\`\`

Create a \`.env\` file in the \`backend\` directory based on the example:
\`\`\`bash
cp .env.example .env
\`\`\`
Fill in your \`MONGO_URI\` and \`JWT_SECRET\`.

Start the server:
\`\`\`bash
npm run dev
\`\`\`
_Server follows port 5000 by default._

### 3. Frontend Setup
Open a new terminal, navigate to the root directory (frontend), and install dependencies:
\`\`\`bash
# From the root 'eventro_dev' folder
npm install
\`\`\`

Create a \`.env\` file in the root directory:
\`\`\`bash
cp .env.example .env
\`\`\`

Start the React development server:
\`\`\`bash
npm start
\`\`\`
_The app will launch at http://localhost:3000_

## 📂 Project Structure

\`\`\`
eventro_dev/
├── backend/                 # Express Server & API
│   ├── config/              # DB connection
│   ├── controllers/         # Request logic
│   ├── models/              # Mongoose Schemas
│   ├── routes/              # API Endpoints
│   └── uploads/             # Static file storage
├── src/                     # React Frontend
│   ├── components/          # Reusable UI components
│   ├── context/             # Global State (Auth)
│   ├── pages/               # Route Views (Admin & Student)
│   └── styles/              # Global CSS
└── ...
\`\`\`

## 🛡️ Security & Best Practices
*   **Role-Based Access Control (RBAC)**: Distinct layouts and route protection for Admin vs. Student.
*   **Password Hashing**: Secure storage using bcrypt.
*   **Token Authentication**: Stateless authentication via JWT.

## 🤝 Contributing
Contributions are welcome! Please fork the repository and create a pull request.

## 📄 License
This project is licensed under the MIT License.
