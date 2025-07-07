const { database } = require('../../configurations/DatabaseConnections');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../../configurations/jwt');
const nodemailer = require('nodemailer');

module.exports.requestPasswordReset = (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required.' });

  const checkUserSql = 'SELECT id FROM users WHERE email = ? LIMIT 1';
  database.query(checkUserSql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const userId = results[0].id;

    // Create a token valid for 1 hour
    const token = jwt.sign({ id: userId, email }, secret, { expiresIn: '1h' });

    // Prepare email transporter (use your SMTP config here)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      console.log('🔐 RESET TOKEN:',token);
    const resetLink = `http://yourfrontend.com/reset-password/${token}`;

    const mailOptions = {
      from: 'no-reply@orderboard.com',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({ message: 'Failed to send reset email' });
      }

      res.status(200).json({ message: 'Password reset email sent successfully' });
    });
  });
};


module.exports.resetPassword = (req, res) => {
  const { password } = req.body;
  const token = req.params.token; // Grab the token from URL

  if (!token) {
    return res.status(400).json({ message: 'Invalid or missing token.' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }

  try {
    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
      }

      const userId = decoded.id;

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user password in DB
      const sql = 'UPDATE users SET password = ? WHERE id = ?';
      database.query(sql, [hashedPassword, userId], (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: 'Database error.' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ message: 'Password reset successful.' });
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};