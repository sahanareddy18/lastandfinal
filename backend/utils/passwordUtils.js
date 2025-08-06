import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Password validation regex patterns
const PASSWORD_REGEX = {
  MIN_LENGTH: /.{8,}/,
  HAS_UPPERCASE: /[A-Z]/,
  HAS_LOWERCASE: /[a-z]/,
  HAS_NUMBER: /\d/,
  HAS_SYMBOL: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
};

// Password strength validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (!PASSWORD_REGEX.MIN_LENGTH.test(password)) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!PASSWORD_REGEX.HAS_UPPERCASE.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!PASSWORD_REGEX.HAS_LOWERCASE.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!PASSWORD_REGEX.HAS_NUMBER.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!PASSWORD_REGEX.HAS_SYMBOL.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Hash password with bcrypt
export const hashPassword = async (password) => {
  const saltRounds = 12; // Higher number = more secure but slower
  return await bcrypt.hash(password, saltRounds);
};

// Compare password with hash
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate password reset token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash reset token for storage
export const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Generate secure random password
export const generateSecurePassword = (length = 12) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each required category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Symbol
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Check password strength score (0-100)
export const getPasswordStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (PASSWORD_REGEX.HAS_UPPERCASE.test(password)) score += 20;
  if (PASSWORD_REGEX.HAS_LOWERCASE.test(password)) score += 20;
  if (PASSWORD_REGEX.HAS_NUMBER.test(password)) score += 20;
  if (PASSWORD_REGEX.HAS_SYMBOL.test(password)) score += 20;
  
  // Bonus for mixed case and numbers
  if (PASSWORD_REGEX.HAS_UPPERCASE.test(password) && PASSWORD_REGEX.HAS_LOWERCASE.test(password)) {
    score += 10;
  }
  
  return Math.min(score, 100);
};

// Get password strength label
export const getPasswordStrengthLabel = (strength) => {
  if (strength >= 80) return 'Very Strong';
  if (strength >= 60) return 'Strong';
  if (strength >= 40) return 'Medium';
  if (strength >= 20) return 'Weak';
  return 'Very Weak';
}; 