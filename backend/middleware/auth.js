import { verifyToken } from '../utils/jwtUtils.js';
import User from '../models/User.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required' 
      });
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required' 
    });
  }
  next();
};

// Middleware to check if user is admin or the same user
export const requireAdminOrSelf = (req, res, next) => {
  const userId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin' || req.user._id.toString() === userId) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Access denied' 
  });
};

// Rate limiting middleware for login attempts
export const rateLimit = (req, res, next) => {
  // This is a simple rate limiting implementation
  // In production, you might want to use a more robust solution like Redis
  const clientIP = req.ip;
  const now = Date.now();
  
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = new Map();
  }
  
  const userAttempts = req.app.locals.rateLimit.get(clientIP) || {
    count: 0,
    resetTime: now + (15 * 60 * 1000) // 15 minutes
  };
  
  if (now > userAttempts.resetTime) {
    userAttempts.count = 0;
    userAttempts.resetTime = now + (15 * 60 * 1000);
  }
  
  if (userAttempts.count >= 5) {
    return res.status(429).json({ 
      error: 'Too many login attempts. Please try again later.' 
    });
  }
  
  userAttempts.count++;
  req.app.locals.rateLimit.set(clientIP, userAttempts);
  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}; 