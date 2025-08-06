import express from 'express';
import User from '../models/User.js';
import { hashPassword, validatePassword } from '../utils/passwordUtils.js';

const router = express.Router();

// ✅ Fetch all admins
router.get('/', async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select('_id username email');
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: "Error fetching admins" });
  }
});

// ✅ Update admin credentials
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

    // Check if username already exists (excluding current admin)
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

    // Update admin credentials
    const admin = await User.findOneAndUpdate(
      { _id: id, role: 'admin' },
      { 
        username, 
        password: hashedPassword,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ 
      message: "Admin credentials updated successfully", 
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Update admin credentials error:', error);
    res.status(500).json({ error: "Failed to update admin credentials" });
  }
});

// ✅ Get admin by ID
router.get('/:id', async (req, res) => {
  try {
    const admin = await User.findOne({ 
      _id: req.params.id, 
      role: 'admin' 
    }).select('_id username email role');
    
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    res.json(admin);
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({ error: "Error fetching admin" });
  }
});

export default router;
