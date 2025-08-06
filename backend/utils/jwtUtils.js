import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Generate access token for user
export const generateAccessToken = (user) => {
  const payload = {
    userId: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };
  
  return generateToken(payload);
};

// Generate refresh token
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    type: 'refresh'
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d' 
  });
};

// Decode token without verification (for getting user info)
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}; 