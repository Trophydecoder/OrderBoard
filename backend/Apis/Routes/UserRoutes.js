const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UserController');
const verifyToken = require('../../middlewares/verifytoken');

router.put('/profile', verifyToken, userController.updateProfile);

module.exports = router;
