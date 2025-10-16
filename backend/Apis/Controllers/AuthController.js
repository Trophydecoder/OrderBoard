const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { database, secret, expiresIn } = require('../../configurations/DatabaseConnections');


// ----------------- Register -----------------
module.exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if email already exists
    const checkSql = 'SELECT id FROM users WHERE email = $1';
    const checkResult = await database.query(checkSql, [email]);
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert user
    const insertSql = `
      INSERT INTO users (username, email, password, plan, isDeleted)
      VALUES ($1, $2, $3, $4, false)
      RETURNING id, username, email, plan
    `;
    const result = await database.query(insertSql, [username, email, hash, 'Free']);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------- Login -----------------
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const sql = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
    const result = await database.query(sql, [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, plan: user.plan },
      secret,
      { expiresIn }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, username: user.username, plan: user.plan }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------- Get Profile -----------------
module.exports.getProfile = async (req, res) => {
  const userId = req.user.id; // populated by middleware after verifying JWT

  try {
    const sql = 'SELECT id, username, email, plan FROM users WHERE id = $1';
    const result = await database.query(sql, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
