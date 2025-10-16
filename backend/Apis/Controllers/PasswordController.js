const { database } = require('../../configurations/DatabaseConnections');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret } = require('../../configurations/jwt');
const nodemailer = require('nodemailer');

// ----------------- Request Password Reset -----------------
module.exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const result = await database.query(
      'SELECT id, username FROM users WHERE email = $1 AND isDeleted = false LIMIT 1',
      [email]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Email not found.' });
    }

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"OrderBoard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'OrderBoard Password Reset',
      html: `
        <p>Hello ${user.username},</p>
        <p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Password reset email sent successfully.' });

  } catch (err) {
    console.error('Password reset request error:', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ----------------- Reset Password -----------------
module.exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!token) return res.status(400).json({ message: 'Invalid or missing token.' });
  if (!password) return res.status(400).json({ message: 'Password is required.' });

  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await database.query(
      'UPDATE users SET password = $1 WHERE id = $2 AND isDeleted = false',
      [hashedPassword, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found or already deleted.' });
    }

    return res.status(200).json({ message: 'Password reset successful.' });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
};