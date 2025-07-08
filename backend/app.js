const express = require('express');
const cors = require('cors');

const authRoutes = require('./Apis/Routes/authroutes');
const orderRoutes = require('./Apis/Routes/orderRoutes');
const userRoutes = require('./Apis/Routes/UserRoutes');
const passwordRoutes = require('./Apis/Routes/PasswordRoutes');

const app = express();

// Middleware
app.use(express.json()); // Built-in body parser

const allowedOrigins = [
  'http://localhost:4200', // Angular dev server
  'https://orderboard-production.up.railway.app', // Your Railway backend
  'https://your-frontend-domain.com' // Add this when deployed frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin: ' + origin));
    }
  },
  credentials: true, // if sending cookies or auth headers
}));

  

// ✅ Health check route for Railway/Vercel testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'OrderBoard API is running ✅' });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', userRoutes);
app.use('/api', passwordRoutes);

// Default 404 route for unknown APIs
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

module.exports = app;
