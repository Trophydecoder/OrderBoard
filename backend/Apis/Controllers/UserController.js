const { database } = require('../../configurations/DatabaseConnections');

module.exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: 'Username and email are required.' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  try {
    // Check if email already exists for another user
    const checkEmailSql = 'SELECT id FROM users WHERE email = $1 AND id != $2';
    const checkResult = await database.query(checkEmailSql, [email, userId]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({ message: 'Email already in use by another account.' });
    }

    // Update username and email
    const updateSql = 'UPDATE users SET username = $1, email = $2 WHERE id = $3';
    const updateResult = await database.query(updateSql, [username, email, userId]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Profile updated successfully.', username, email });

  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
