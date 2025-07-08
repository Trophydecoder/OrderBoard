require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Global error handlers to catch unexpected crashes
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

app.use(cors({
  origin: 'http://localhost:4200'  // change as needed
}));

app.use(bodyParser.json());

// Simple health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running ✅' });
});

// Example auth route
app.post('/api/LoginUser', (req, res) => {
  // For demo purposes, just respond success
  res.json({ message: 'Login endpoint reached' });
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = app;
