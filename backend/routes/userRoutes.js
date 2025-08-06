import express from 'express';
import User from '../models/User.js';
import { hashPassword, validatePassword } from '../utils/passwordUtils.js';

const router = express.Router();

// ✅ Fetch all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select('_id username email role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// ✅ Update user credentials
router.put('/update-credentials', async (req, res) => {
  const { id, username, password } = req.body;

  if (!id || !username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Check if username already exists (excluding current user)
    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: id } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username already exists' 
      });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user credentials
    const user = await User.findOneAndUpdate(
      { _id: id, role: 'user' },
      { 
        username, 
        password: hashedPassword,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      message: "User credentials updated successfully", 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user credentials error:', error);
    res.status(500).json({ error: "Failed to update user credentials" });
  }
});

// ✅ Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      role: 'user' 
    }).select('_id username email role');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: "Error fetching user" });
  }
});

export default router;
