const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // <-- Initialize dotenv FIRST before importing any routes or controllers

const cors = require('cors'); // Import cors
const path = require('path');
const connectDB = require('./config/db');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const clubRoutes = require('./routes/clubRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
// const paymentRoutes = require('./routes/paymentRoutes'); // (still commented out)

// Connect to database
connectDB();

const app = express();

// --- CORS Configuration ---
// We will allow all connections for now.
// For production, you'd restrict this to your Vercel URL.
app.use(cors());
// --------------------------

app.use(express.json()); // Middleware to parse JSON

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[Backend Log] ${req.method} ${req.originalUrl}`);
  console.log("Request Body:", req.body);
  next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/superadmin', superAdminRoutes);
// app.use('/api/payment', paymentRoutes);

// --- Deployment ---
// We need to serve the 'uploads' and 'images' folders
// so the live frontend can access them.
const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, 'uploads')));
app.use('/images', express.static(path.join(dirname, 'images')));
// --- End Deployment ---

app.get('/', (req, res) => {
  res.send('EVENTRO API is running...');
});

// Error Handling Middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});