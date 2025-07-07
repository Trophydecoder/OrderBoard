const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { database ,secret, expiresIn } = require('../../configurations/DatabaseConnections');
const nodemailer = require('nodemailer');

// Utility regex functions
function isOnlyLetters(str) {
  return /^[A-Za-z\s]+$/.test(str);
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isStrongPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

module.exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // Basic required fields
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate formats
  if (!isOnlyLetters(username)) {
    return res.status(400).json({ message: 'Username must only contain letters and spaces' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters with letters and numbers' });
  }

  // Check deleted users
  const checkDeleted = 'SELECT * FROM deleted_users WHERE email = ?';
  database.query(checkDeleted, [email], (err, deleted) => {
    if (err) return res.status(500).json({ message: 'Error checking deleted users' });
    if (deleted.length > 0) {
      return res.status(409).json({ message: 'This email was previously deleted and cannot be reused' });
    }

    // Check existing users
    const checkSql = 'SELECT * FROM users WHERE email = ?';
    database.query(checkSql, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length > 0) return res.status(409).json({ message: 'Email already exists' });

      const hash = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO users (username, email, password, plan) VALUES (?, ?, ?, ?)';
      database.query(sql, [username, email, hash, 'Free'], err => {
        if (err) return res.status(500).json({ message: 'Registration failed' });

        console.log(` New user registered: ${username} (${email})`);
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  });
};




module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Basic check
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Find user
  const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  database.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];

    // Soft deleted?
    if (user.is_deleted) {
      return res.status(403).json({
        message: 'This account has been deleted. Restore your account to continue.',
        showRestoreOption: true
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    // Generate token
    const token = jwt.sign({
      id: user.id,
      email: user.email,
      username: user.username,
      plan: user.plan
    }, secret, { expiresIn });

    // Success
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        plan: user.plan
      }
    });
  });
};



function isStrongPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

//  Send Reset Email
module.exports.requestPasswordReset = (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  database.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Email not found' });

    const user = results[0];

    // Generating a short-lived reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: '15m' }
    );

    console.log('🔐 RESET TOKEN:', resetToken);

    // Build reset link
    const resetLink = `http://localhost:4200/reset-password/${resetToken}`
    console.log('📧 RESET LINK:', resetLink);

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS  // your password or app password
      }
    });

    const mailOptions = {
      from: 'OrderBoard <yourorderboard@gmail.com>',
      to: user.email,
      subject: 'OrderBoard Password Reset',
      html: `
        <p>Hello ${user.username},</p>
        <p>You requested a password reset.</p>
        <p>
          <a href="${resetLink}" style="
            background-color:#0B3D91;
            color:white;
            padding:10px 15px;
            border-radius:5px;
            text-decoration:none;">
            Click here to reset your password
          </a>
        </p>
        <p>This link will expire in 15 minutes.</p>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Email error:', err);
        return res.status(500).json({ message: 'Failed to send email' });
      }

      console.log('Reset email sent:', info.response);
      res.status(200).json({ message: 'Password reset email sent successfully' });
    });
  });
};






module.exports.resetPassword = (req, res) => {
  const token = req.params.token;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long and include at least one letter and one number.'
    });
  }

  //  Verify token
  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded.id;

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateSql = 'UPDATE users SET password = ? WHERE id = ? AND is_deleted = 0';

      database.query(updateSql, [hashedPassword, userId], (dbErr, result) => {
        if (dbErr) {
          console.error(dbErr);
          return res.status(500).json({ message: 'Database error updating password' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found or has been deleted' });
        }

        console.log(' Password updated successfully');
        res.status(200).json({ message: 'Password updated successfully' });
      });
    } catch (hashErr) {
      console.error(hashErr);
      return res.status(500).json({ message: 'Password hashing failed' });
    }
  });
};




//  Reset password while logged in
module.exports.resetPasswordLoggedIn = async (req, res) => {
  const userId = req.user.id; // from verifyToken middleware
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long and include at least one letter and one number.'
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateSql = 'UPDATE users SET password = ? WHERE id = ? AND is_deleted = 0';

    database.query(updateSql, [hashedPassword, userId], (dbErr, result) => {
      if (dbErr) {
        console.error(dbErr);
        return res.status(500).json({ message: 'Database error updating password' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found or has been deleted' });
      }

      console.log(' Password updated successfully for user:', userId);
      res.status(200).json({ message: 'Password updated successfully' });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Password hashing failed' });
  }
};








//phase  getUser profile

    module.exports.getProfile = (req, res) => {
      const userId = req.user.id;
    
      const userSql = 'SELECT id, username, email, plan FROM users WHERE id = ?';
      const ordersSql = 'SELECT COUNT(*) AS totalOrders FROM orders WHERE user_id = ? AND isDeleted = 0';
    
      database.query(userSql, [userId], (err, userResult) => {
        if (err) return res.status(500).json({ message: 'User lookup failed' });
        if (userResult.length === 0) return res.status(404).json({ message: 'User not found' });
    
        const user = userResult[0];
    
        database.query(ordersSql, [userId], (err2, orderResult) => {
          if (err2) {
            console.error('Order count SQL error:', err2);
            return res.status(500).json({ message: 'Order count failed' });
          }
    
          const totalOrders = (orderResult[0] && orderResult[0].totalOrders) || 0;
    
          res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            plan: user.plan,
            totalOrders
          });
        });
      });
    };    
  


   module.exports.updateUser = (req, res) => {
      const userId = req.user.id; // From verifyToken middleware
      const { username, email } = req.body;
    
      if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
      }
    
      // Validate username and email
      if (!/^[A-Za-z\s]+$/.test(username)) {
        return res.status(400).json({ message: "Username must only contain letters and spaces" });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
    
      // Check if user exists and is not soft-deleted
      const checkUserSql = 'SELECT * FROM users WHERE id = ? AND is_deleted = 0';
      database.query(checkUserSql, [userId], (err, userResult) => {
        if (err) return res.status(500).json({ message: "Database error checking user" });
        if (userResult.length === 0) {
          return res.status(404).json({ message: "User not found or has been deleted" });
        }
    
        // Check for duplicate email (excluding current user)
        const checkEmailSql = 'SELECT * FROM users WHERE email = ? AND id != ? AND is_deleted = 0';
        database.query(checkEmailSql, [email, userId], (err, emailResult) => {
          if (err) return res.status(500).json({ message: "Database error checking email" });
          if (emailResult.length > 0) {
            return res.status(400).json({ message: "Email already in use by another account" });
          }
    
          // Update username and email only
          const sql = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
          const params = [username, email, userId];
    
          database.query(sql, params, (err, result) => {
            if (err) return res.status(500).json({ message: "Error updating user" });
    
            // Generate a new JWT token with updated info
            const updatedUser = {
              id: userId,
              username: username,
              email: email,
              plan: userResult[0].plan
            };
    
            const newToken = jwt.sign(updatedUser, secret, { expiresIn });
    
            return res.status(200).json({
              message: "User updated successfully",
              token: newToken
            });
          });
        });
      });
    };
    








    
// module.exports.restoreAccount = (req, res) => {
//   const { username } = req.body;
//   if (!username) return res.status(400).json({ message: 'Username required' });

//   const sql = 'UPDATE users SET is_deleted = false WHERE username = ?';
//   database.query(sql, [username], (err, result) => {
//     if (err) return res.status(500).json({ message: 'Restore failed' });
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.status(200).json({ message: 'Account restored' });
//   });
// };
