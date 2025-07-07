const express = require('express');
const router = express.Router();
const { database } = require('../../configurations/DatabaseConnections');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../../configurations/jwt');
const authenticateToken = require('../../middlewares/verifytoken');

router.get('/auth/refresh-token', authenticateToken, (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      secret,
      { expiresIn: expiresIn }
    );
  
    res.json({ token });
  });

  //each time the user Changes the profile things , it refreshes 