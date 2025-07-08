const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./Apis/Routes/authroutes');
const orderRoutes = require('./Apis/Routes/orderRoutes');
const userRoutes = require('./Apis/Routes/UserRoutes');
const passwordRoutes = require('./Apis/Routes/PasswordRoutes');



const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: 'https://order-board-icql7vuoq-trophydecoders-projects.vercel.app'
  }));

const path = require('path');
app.use('/slips', express.static(path.join(__dirname, 'slips')))





// Routes
app.use('/api', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', userRoutes);
app.use('/api', passwordRoutes);

// Serve Angular build files
app.use(express.static(path.join(__dirname, '../frontend/dist/OrderBoardApp')));

// For any route not handled by the API, serve Angular index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/OrderBoardApp/index.html'));
});


module.exports = app; 