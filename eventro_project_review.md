# Eventro - Comprehensive Project Review Report

This report summarizes the architecture, technologies, and features of the **Eventro** application. It serves as a technical overview for reviewers, highlighting what was used to build the platform and how its different components work together.

## 1. Overall Architecture
Eventro is a comprehensive campus event management system built on the **MERN** stack:
*   **M**ongoDB: NoSQL Database (handled via Mongoose ODM)
*   **E**xpress.js: Backend web application framework
*   **R**eact: Frontend UI library
*   **N**ode.js: JavaScript runtime environment

The application follows a standard client-server architecture where a React frontend communicates with a RESTful Node.js/Express API.

## 2. Frontend Details (Client-Side)

The frontend is a Single Page Application (SPA) built with React.

**Core Technologies:**
*   **React (v19.x)**: UI component creation and state management.
*   **React Router (v7.x)**: Handles complex routing, including layout wrappers for public, admin, and student roles.
*   **Context API**: Used for global state management, specifically for Authentication (`AuthContext`).
*   **CSS3**: Custom vanilla CSS ([App.css](file:///c:/Users/sathw/OneDrive/Documents/PROGRAMING/eventro_dev/src/App.css), [index.css](file:///c:/Users/sathw/OneDrive/Documents/PROGRAMING/eventro_dev/src/index.css), component-specific styles) is used for styling and layout avoiding heavy CSS frameworks.

**Libraries & Integrations:**
*   **Axios**: For making HTTP requests to the backend API.
*   **Chart.js & react-chartjs-2**: To visualize analytics data for administrators (e.g., registrations, engagement).
*   **react-big-calendar**: Provides an interactive calendar view for students to track upcoming events and deadlines.
*   **react-toastify**: For seamless, user-friendly notification popups.
*   **moment.js**: For date and time manipulation across the app.
*   **html2pdf.js**: To allow users to export specific views or tickets as PDFs.
*   **react-icons**: Wide variety of icon assets used through the UI.

**Architecture highlights:**
*   **Role-Based Layouts**: The application strictly separates user experiences using `AdminLayout`, `StudentLayout`, and [PublicLayout](file:///c:/Users/sathw/OneDrive/Documents/PROGRAMING/eventro_dev/src/App.js#52-62). It uses specific route guards (`AdminRoute`, `StudentRoute`) to secure components and redirect unauthorized traffic.
*   **Vast Feature Set Pages**: Separate dedicated pages exist for managing posts, managing departments/clubs, tracking progress, analytics, social feed, and individual dashboards.

## 3. Backend Details (Server-Side)

The backend provides a robust RESTful API built with Node.js and Express.

**Core Technologies:**
*   **Express (v5.x)**: Handles route definitions, middleware routing, and HTTP requests/responses.
*   **Mongoose (v8.x)**: Object Data Modeling (ODM) library acting as an abstraction layer to interact with MongoDB.
*   **JSON Web Tokens (JWT) & bcryptjs**: Used for secure authentication. Passwords are encrypted before database storage using bcrypt, and stateless sessions are maintained using JWTs.

**Libraries & Integrations:**
*   **Multer**: Middleware designed to handle `multipart/form-data`, primarily used for uploading event images and files.
*   **Nodemailer**: Used to send email notifications, confirmations, or password resets to users.
*   **Razorpay**: Integrated for handling payment gateways (event ticket purchases, though implementation details depend on the feature rollout).
*   **json2csv**: To generate and export event registration data in CSV format for administrative use.

**Architecture highlights:**
*   **Modular Routing**: Routes are logically divided into separate files representing entities: `userRoutes`, `eventRoutes`, `registrationRoutes`, `postRoutes`, `clubRoutes`, `collegeRoutes`, `announcementRoutes`, `notificationRoutes`, `uploadRoutes`, and `paymentRoutes`.
*   **Entity Models**: 
    *   **User/Role schema**: Represents Admin, College Admin, Club Coordinator, and Student accounts.
    *   **Event schema**: Handles event metadata (date, location, description).
    *   **Registration schema**: Manages the junction between users and events.
    *   **Post/Announcement schema**: Content models for social feeds and campus updates.
    *   **Club/Department/College schemas**: Models that define the B2B hierarchical structure of users.

## 4. Key Security & Best Practices
*   **Role-Based Access Control (RBAC)**: Implemented on both ends. 
    *   *Frontend:* Route wrappers prevent students from accessing admin URLs.
    *   *Backend:* API endpoints restrict data modification based on the user's token claims.
*   **Environment Variables**: Sensitive data such as `MONGO_URI`, `JWT_SECRET`, Razorpay keys, and email credentials are kept out of source code using `dotenv`.
*   **CORS Configuration**: Restricts API calls to approved frontend origins, preventing malicious cross-site requests.
*   **File Uploads**: Files are managed via Multer and are securely saved in a segregated `/uploads` directory.

## Summary

Eventro leverages a modern, stable MERN stack tailored for scalability. The detailed breakdown of entities (departments, clubs, colleges) indicates a solid architectural design that supports a complex multi-tenant or B2B structure. The use of custom CSS combined with targeted libraries (Chart.js, react-big-calendar) ensures a fast, responsive, and visually interactive user experience without the bloat of excessive UI frameworks.
