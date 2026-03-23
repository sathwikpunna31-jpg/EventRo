const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Checks if user is logged in
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- THIS IS THE CRITICAL LINE ---
      // Fetch the user from the database *every time* to get fresh data
      // (This ensures we get the new profilePicture path)
      // We remove the password from the data sent to the next step
      req.user = await User.findById(decoded.id).select('-password');
      // -------------------------------

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Move on to the next function (e.g., getUserProfile)
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Checks if user is a collegeAdmin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'collegeAdmin') {
    next(); // User is an admin, proceed
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' }); // 403 Forbidden
  }
};

// Checks if user is a clubCoordinator OR a collegeAdmin
const coordinatorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'collegeAdmin' || req.user.role === 'clubCoordinator' || req.user.role === 'superAdmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized to manage events' });
  }
};

// Grant access to specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user ? req.user.role : 'User'} is not authorized to access this route.`
      });
    }
    next();
  }
};

module.exports = { protect, admin, coordinatorOrAdmin, authorizeRoles };