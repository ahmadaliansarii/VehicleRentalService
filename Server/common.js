const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('./db');

// User Signup
router.post('/signup', async (req, res) => {
    const { role, first_name, last_name, email, phone_number, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
            INSERT INTO user (role, first_name, last_name, email, phone_number, password)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [role, first_name, last_name, email, phone_number, hashedPassword], (err, results) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ success: false, message: 'Signup failed' });
            }
            res.json({ success: true, message: 'Signup successful' });
        });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ success: false, message: 'Signup failed' });
    }
});

// User Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const sql = 'SELECT * FROM user WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const updateSql = 'UPDATE user SET LoggedIn = ? WHERE user_id = ?';
        db.query(updateSql, ['Yes', user.user_id], (err, updateResults) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error updating login status' });
            }

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    user_id: user.user_id,
                    role: user.role,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone_number: user.phone_number,
                },
            });
        });
    });
});

router.post('/change-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
  
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'User ID, current password, and new password are required.' });
    }
  
    db.query('SELECT password FROM user WHERE user_id = ?', [userId], async (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
  
      const storedPassword = results[0].password;
  
      const isMatch = await bcrypt.compare(currentPassword, storedPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      db.query('UPDATE user SET password = ? WHERE user_id = ?', [hashedPassword, userId], (updateErr, updateResults) => {
        if (updateErr) {
          console.error('Error updating password:', updateErr);
          return res.status(500).json({ success: false, message: 'Failed to update password.' });
        }
  
        res.json({ success: true, message: 'Password changed successfully.' });
      });
    });
  });

// Logout
router.post('/logout', (req, res) => {
    const { userId } = req.body;

    db.query('UPDATE user SET LoggedIn = ? WHERE user_id = ?', ['No', userId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, message: 'Logout successful.' });
    });
});


module.exports = router;