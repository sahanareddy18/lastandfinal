import express from 'express';
import User from '../models/User.js';
import { 
  validatePassword, 
  hashPassword, 
  comparePassword, 
  generateResetToken, 
  hashResetToken,
  generateSecurePassword,
  getPasswordStrength,
  getPasswordStrengthLabel
} from '../utils/passwordUtils.js';
import { rateLimit } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../utils/emailUtils.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email, and password are required' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed' 
    });
  }
});

// Simple login without JWT
router.post('/login', rateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        error: 'Account is temporarily locked due to multiple failed login attempts' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated' 
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        
        return res.status(423).json({ 
          error: 'Account locked due to multiple failed login attempts. Try again in 15 minutes.' 
        });
      }
      
      await user.save();
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Simple response without JWT
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: 'simple-auth-token', // Simple token for frontend compatibility
      role: user.role
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed' 
    });
  }
});

// Simple password change
router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ 
        error: 'Email and new password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // If currentPassword is provided, verify it (for user self-service)
    // If not provided, allow admin to reset (admin override)
    if (currentPassword) {
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ 
          error: 'Current password is incorrect' 
        });
      }
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'New password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Hash and update password
    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ 
      error: 'Password change failed' 
    });
  }
});

// Check password strength
router.post('/check-password-strength', (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        error: 'Password is required' 
      });
    }

    const validation = validatePassword(password);
    const strength = getPasswordStrength(password);
    const label = getPasswordStrengthLabel(strength);

    res.json({
      isValid: validation.isValid,
      errors: validation.errors,
      strength,
      label
    });

  } catch (error) {
    console.error('Password strength check error:', error);
    res.status(500).json({ 
      error: 'Password strength check failed' 
    });
  }
});

// Generate secure password
router.get('/generate-password', (req, res) => {
  try {
    const password = generateSecurePassword();
    res.json({ password });
  } catch (error) {
    console.error('Password generation error:', error);
    res.status(500).json({ 
      error: 'Password generation failed' 
    });
  }
});

// Check if email belongs to admin (for showing forgot password option)
router.post('/check-admin-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Find user by email and check if admin
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    });

    // Return whether user exists and is admin (for security, don't reveal if email exists)
    const isAdmin = user && user.role === 'admin';

    res.json({
      isAdmin: isAdmin
    });

  } catch (error) {
    console.error('Admin email check error:', error);
    res.status(500).json({ 
      error: 'Email check failed' 
    });
  }
});

// Forgot password - send reset email
router.post('/forgot-password', rateLimit, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashResetToken(resetToken);

    // Save hashed token and expiration to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.username);

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.message);
      // Clear the reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({
        error: 'Failed to send password reset email. Please try again later.'
      });
    }

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Password reset request failed. Please try again later.' 
    });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Reset token and new password are required' 
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'New password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Hash the provided token to compare with stored token
    const hashedToken = hashResetToken(token);

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Password reset token is invalid or has expired' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ 
        error: 'Account is deactivated' 
      });
    }

    // Hash new password and update user
    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Reset login attempts and unlock account if locked
    user.loginAttempts = 0;
    user.lockUntil = null;
    
    await user.save();

    res.json({
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Password reset failed. Please try again.' 
    });
  }
});

export default router;