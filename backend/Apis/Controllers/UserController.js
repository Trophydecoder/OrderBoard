const { database } = require('../../configurations/DatabaseConnections');

module.exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: 'Username and email are required.' });
  }

  // Simple email regex for basic validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  // Check if email already used by another user
  const checkEmailSql = 'SELECT id FROM users WHERE email = ? AND id != ?';
  database.query(checkEmailSql, [email, userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length > 0) {
      return res.status(409).json({ message: 'Email already in use by another account.' });
    }

    // Update user info
    const updateSql = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
    database.query(updateSql, [username, email, userId], (err2) => {
      if (err2) return res.status(500).json({ message: 'Failed to update profile.' });

      res.status(200).json({ message: 'Profile updated successfully.', username, email });
    });
  });
};
