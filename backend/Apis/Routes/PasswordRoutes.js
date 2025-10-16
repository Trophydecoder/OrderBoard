const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifytoken');
const passwordController = require('../Controllers/PasswordController')

router.post('/request-password-reset', passwordController.requestPasswordReset);
router.post('/reset-password/:token', passwordController.resetPassword);
module.exports = router;