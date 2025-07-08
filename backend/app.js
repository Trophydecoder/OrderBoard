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


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'OrderBoard API is running ✅' });
});




// Routes
app.use('/api', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', userRoutes);
app.use('/api', passwordRoutes);




module.exports = app; 