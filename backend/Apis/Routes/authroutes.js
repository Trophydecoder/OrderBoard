const express = require('express');
const router = express.Router();
const controller = require('../Controllers/AuthController');
const verifyToken = require('../../middlewares/verifytoken');
const jwt = require('jsonwebtoken');
const {  secret, expiresIn } = require('../../configurations/jwt')

//routes
router.post('/RegisterUser', controller.register);
router.post('/LoginUser', controller.login);
// router.post('/restore-account', controller.restoreAccount);
// router.post('/forgot-password/reset',controller.requestPasswordReset);
router.get('/user/profile', verifyToken,controller.getProfile);





module.exports = router;
