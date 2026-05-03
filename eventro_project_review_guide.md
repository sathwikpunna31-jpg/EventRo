# Eventro - Project Review Master Guide

This document is designed to give you a complete, top-to-bottom understanding of the **Eventro (Campus Event Management System)** project. It covers everything from what technologies were used, file structures, execution flows, and how the frontend talks to the backend. Use this as your "cheat sheet" to handle any question during your review.

---

## 1. What We Used (The Tech Stack)

The project is built on the **MERN Stack**.

### Frontend (Client-Side)
*   **React (v19)**: The core library used for building user interfaces. We use functional components and hooks (`useState`, `useEffect`, `useContext`).
*   **React Router (v7)**: Used for handling navigation. It allows us to build a Single Page Application (SPA) where the page doesn't reload when switching tabs (e.g., from Dashboard to Events mapping in `App.js`).
*   **Context API (`AuthContext`)**: Used for global state management. Instead of passing props down manually through every component, we use this to keep track of if a user is logged in everywhere in the app.
*   **Axios**: An HTTP client used to send requests from our React pages to our Node.js backend.
*   **Chart.js / React-Chartjs-2**: Used in the Admin Analytics page to display visual data charts.
*   **CSS3 (Custom)**: We used custom CSS to create the modern, premium "Aura Glass" UI design. 

### Backend (Server-Side)
*   **Node.js**: The runtime environment executing our JavaScript code on the server.
*   **Express.js**: A web application framework for Node.js. It simplifies creating API endpoints (routes), handling requests, and responding.
*   **MongoDB**: Our NoSQL database used to store users, events, posts, registrations, etc. Data is stored in flexible, JSON-like documents.
*   **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js. It lets us define strict rules (Schemas) for what data should look like before saving it to the database.

### Security & Utilities
*   **JWT (JSON Web Tokens)**: Used for authentication. When a user logs in, the backend gives them a token. The frontend sends this token with every subsequent request to prove who they are.
*   **Bcrypt.js**: Used for securely hashing user passwords before storing them in the database.
*   **Multer**: Used to handle file uploads, such as uploading images or documents.
*   **Moment.js**: Used for parsing, validating, and formatting dates (e.g., event start/end times).

---

## 2. Where We Used What (Project Structure)

The project is divided into two distinct parts: `eventro_dev/src/` (Frontend) and `eventro_dev/backend/` (Backend).

### Backend Structure (`/backend`)
*   **`server.js`**: The heart of the backend. It connects to the database, configures middleware (like CORS and JSON parsers), and binds the URLs to the routers.
*   **`config/db.js`**: Handles the connection string and connects to the MongoDB cluster.
*   **`models/`**: Defines the "shape" of our database.
    *   *Examples: `userModel.js`, `eventModel.js`, `registrationModel.js`, `postModel.js`.*
*   **`controllers/`**: Contains the actual business logic ("brains"). When someone makes a request to register for an event, the code that actually creates the registration sits here.
    *   *Examples: `userController.js` (handles login/signup), `eventController.js` (handles creating/editing events).*
*   **`routes/`**: Defines the URLs (endpoints) and maps them to the controllers.
    *   *Examples: In `userRoutes.js`, you'd see something like `router.post('/login', loginUser)`.*
*   **`middleware/`**: Functions that run "in the middle" of a request. For example, `authMiddleware.js` checks if the JWT token is valid before allowing someone to delete an event.

### Frontend Structure (`/src`)
*   **`App.js`**: The main entry point for UI routing. It dictates which component loads when you visit a specific URL (like `/login`, `/dashboard`). Uses nested routes for Public, Admin, and Student layouts.
*   **`components/`**: Reusable building blocks of the UI. Things that appear on multiple pages.
    *   *Examples: `Navbar`, `Footer`, `AdminLayout`, `StudentLayout`, Protected Route wrappers.*
*   **`pages/`**: The distinct full-screen views of our app.
    *   *Examples: `LoginPage`, `HomePage`, `DashboardPage` (Admin), `StudentDashboardPage`.*
*   **`context/AuthContext.js`**: Holds the user's login state locally on the browser.
*   **`styles/` & `App.css`, `index.css`**: Contain the styles for the entire app.

---

## 3. How They Are Running

Because we have a decoupled MERN stack, the frontend and backend are completely separate servers running locally simultaneously.

1.  **Database Connection**: MongoDB is hosted online (typically via MongoDB Atlas) or runs locally. The backend communicates with it via a URI defined in the `.env` file.
2.  **The Backend Server**: Runs on `http://localhost:5000`. You start it by navigating to the `backend/` folder and running `npm run dev` (which uses a tool like `nodemon` or standard node to run `server.js`). It actively listens for incoming HTTP requests.
3.  **The Frontend Server**: Runs on `http://localhost:3000`. You start it by navigating to the root folder `eventro_dev/` and running `npm start`. It serves the React files to the user's web browser.
4.  **CORS**: Because they run on two different ports (3000 and 5000), they are considered different origins. We use the `cors` middleware in `server.js` to allow the React app to talk to the Express backend without being blocked by the browser.

---

## 4. The Request Lifecycle (File-by-File Communication)

What happens when a student logs into the platform or views an event? *This is the most important part to understand for a review.* It is called the **Request/Response lifecycle**. 

Let's trace a **"Get All Events"** action as an example:

### 1. The Trigger (React Page -> Axios)
*   **File:** `src/pages/EventsPage.js` (or similar)
*   **Action:** The component loads, and a `useEffect` hook fires. This hook calls a function that uses Axios: `axios.get('/api/events')`.
*   **What it does:** The frontend sends a GET request across the network to port 5000.

### 2. The Entry Point (server.js)
*   **File:** `backend/server.js`
*   **Action:** The server receives traffic asking for `/api/events`.
*   **Code:** `app.use('/api/events', eventRoutes);`
*   **What it does:** The server sees the prefix `/api/events` and hands the request over to `eventRoutes`.

### 3. The Router (routes)
*   **File:** `backend/routes/eventRoutes.js`
*   **Action:** The router looks at the specific type of request (GET) and the sub-url (`/`).
*   **Code:** `router.route('/').get(getEvents);`
*   **What it does:** It tells the app: "Ah, you want the getEvents function. Go run the logic over in the controller."

### 4. The Brains (controllers)
*   **File:** `backend/controllers/eventController.js`
*   **Action:** The `getEvents` function starts executing.
*   **Code:** `const events = await Event.find({});`
*   **What it does:** The controller needs the data, so it reaches out to the Mongoose Model.

### 5. The Database Query (models)
*   **File:** `backend/models/eventModel.js` -> connects to **MongoDB**.
*   **What it does:** Mongoose translates `Event.find({})` into a MongoDB query. It fetches all the documents stored in the `events` collection.

### 6. The Response (Going back)
*   **File:** `backend/controllers/eventController.js`
*   **Action:** The data comes back from the database.
*   **Code:** `res.json(events);`
*   **What it does:** The backend wraps the event data up as a JSON array and sends an HTTP 200 (OK) response back over the network to port 3000.

### 7. The Update (React Page)
*   **File:** `src/pages/EventsPage.js`
*   **Action:** The `axios` promise resolves.
*   **Code:** `.then((response) => setEvents(response.data))`
*   **What it does:** React takes the data, updates its internal State, and forces the webpage to re-render. You now see the lovely "Aura Glass" cards displaying the fetched events.

---

## 5. Potential Review Questions and Answers

**Q: Explain how we secure certain routes and prevent students from accessing Admin features.**
> **A:** We handle security in two ways. **On the Frontend:** We use protected React Router components (`AdminRoute.js`, `StudentRoute.js`) inside `App.js`. If a user's context state (`AuthContext`) says they aren't an admin, they are redirected away. **On the Backend (The real security):** We use custom middleware like `protect` (verifies the JWT token) and `admin` (checks user role). We place these in the routes (e.g., `router.post('/create', protect, admin, createEvent)`) so even if someone bypasses the frontend, the server restricts them from making that API call.

**Q: What happens if I upload an image for an event?**
> **A:** We use `multer` on the backend (`uploadRoutes.js`). The frontend sends a multipart form data request. Multer catches it, saves it to the local `/uploads/` folder on the server, and returns the file path. The frontend then saves that text path into the MongoDB Event document. `server.js` uses `express.static` to serve that `uploads` folder so images show up dynamically on the URL.

**Q: How does password management work?**
> **A:** In `userController.js`, when a user signs up, before saving to MongoDB, we use `bcrypt.genSalt` and `bcrypt.hash` to encrypt their password. We never store plain text passwords. During login, we use `bcrypt.compare` to encrypt their login attempt and see if it hashes to the same string stored in the database.

**Q: How is the state managed across the application?**
> **A:** Primarily through React's built-in `useState` for component-level state and Context API (`AuthContext`) for global authenticated state. We didn't use Redux because the Context API is perfectly capable and lighter for authentication and basic global state requirements.

### Quick Term Definitions if you are stuck:
*   **Mongoose Schema**: The blueprint of the data (e.g., an Event requires a Title, Date, Location).
*   **JWT Handshake**: Login with Email/Pass -> Server verifies -> Server issues Token -> Frontend stores Token in localStorage -> Frontend sends Token in Authorization Header on every request afterwards.
