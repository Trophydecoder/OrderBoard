const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./Apis/Routes/authroutes');
const orderRoutes = require('./Apis/Routes/orderRoutes');
const userRoutes = require('./Apis/Routes/UserRoutes');
const passwordRoutes = require('./Apis/Routes/PasswordRoutes');



const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:4200' }));

const path = require('path');
app.use('/slips', express.static(path.join(__dirname, 'slips')))



// Routes
app.use('/api', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', userRoutes);
app.use('/api', passwordRoutes);



module.exports = app; 