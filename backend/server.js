const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors
const path = require('path');
const connectDB = require('./config/db');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
// const paymentRoutes = require('./routes/paymentRoutes'); // (still commented out)
const uploadRoutes = require('./routes/uploadRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const clubRoutes = require('./routes/clubRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
dotenv.config();

// Connect to database
connectDB();

const app = express();

// --- CORS Configuration ---
// We will allow all connections for now.
// For production, you'd restrict this to your Vercel URL.
app.use(cors());
// --------------------------

app.use(express.json()); // Middleware to parse JSON

// --- Mount Routers ---
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/upload', uploadRoutes);

// --- Phase 1 & 2: College Structure ---
app.use('/api/departments', departmentRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/announcements', announcementRoutes);
// --------------------------------------

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