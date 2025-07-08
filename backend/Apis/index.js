const app = require('../app'); // Import your existing app

const serverless = require('serverless-http'); // Vercel needs this wrapper

module.exports = serverless(app); // Export as a serverless function
