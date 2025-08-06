# Forgot Password Feature Setup Guide

This guide explains how to set up and use the forgot password functionality in the Pharmacy Management System.

## 🚀 Features Implemented

### Backend Features
- **Secure Token Generation**: Uses crypto module to generate secure reset tokens
- **Token Hashing**: Tokens are hashed before storage for security
- **Token Expiration**: Reset tokens expire after 1 hour
- **Rate Limiting**: Prevents abuse of the forgot password endpoint
- **Email Validation**: Validates email format and existence
- **Password Strength Validation**: Ensures new passwords meet security requirements
- **Account Security**: Clears login attempts and unlocks accounts after successful reset

### Frontend Features
- **Forgot Password Form**: Clean, user-friendly interface for requesting password reset
- **Reset Password Form**: Secure form with password strength indicator
- **Real-time Validation**: Password strength checking and confirmation matching
- **User Feedback**: Clear success/error messages and loading states
- **Navigation**: Easy navigation between login, forgot password, and reset password pages

## 📧 Email Configuration

### 1. Set up Gmail App Password (Recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate a new app password for "Mail"
4. Use this app password in your environment variables

### 2. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-from-step-1
FRONTEND_URL=http://localhost:3000

# Database and other configurations
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
PORT=5000
```

### 3. Alternative Email Services

You can also use other email services by modifying the transporter configuration in `backend/utils/emailUtils.js`:

```javascript
// For Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// For custom SMTP
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-host.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## 🔧 API Endpoints

### Forgot Password Request
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

### Check Password Strength
```http
POST /api/auth/check-password-strength
Content-Type: application/json

{
  "password": "TestPassword123!"
}
```

**Response:**
```json
{
  "isValid": true,
  "errors": [],
  "strength": 90,
  "label": "Very Strong"
}
```

## 🌐 Frontend Routes

- `/login` - Login page with "Forgot Password" link
- `/forgot-password` - Request password reset form
- `/reset-password?token=<token>` - Reset password form (accessed via email link)

## 🔒 Security Features

### Token Security
- Tokens are generated using `crypto.randomBytes(32)`
- Tokens are hashed using SHA-256 before database storage
- Only hashed tokens are stored, never plain text
- Tokens expire after 1 hour

### Rate Limiting
- Forgot password requests are rate-limited to prevent abuse
- Same rate limiting middleware used for login attempts

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Account Protection
- Doesn't reveal whether an email exists in the system
- Clears failed login attempts after successful password reset
- Unlocks accounts that were locked due to failed attempts

## 🧪 Testing

### Manual Testing

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend:**
   ```bash
   cd last
   npm start
   ```

3. **Test the flow:**
   - Go to `http://localhost:3000/login`
   - Click "Forgot your password?"
   - Enter your email address
   - Check your email for the reset link
   - Click the reset link
   - Enter a new password
   - Verify you can login with the new password

### Automated Testing

Run the test script to verify backend functionality:

```bash
cd backend
node test-forgot-password.js
```

## 🎨 UI Components

### ForgotPassword Component
- Clean, responsive design matching the login page
- Email validation
- Loading states
- Success/error messaging
- Navigation back to login

### ResetPassword Component
- Password strength indicator with visual feedback
- Real-time password validation
- Password confirmation matching
- Token validation
- Auto-redirect after successful reset

### Updated Login Component
- Added "Forgot your password?" link
- Maintains existing functionality
- Consistent styling

## 📱 Email Template

The system sends beautifully formatted HTML emails with:
- Professional pharmacy branding
- Clear call-to-action button
- Security information
- Expiration notice
- Support information

## 🔧 Troubleshooting

### Common Issues

1. **Emails not sending:**
   - Verify EMAIL_USER and EMAIL_PASS are correct
   - Check that 2FA is enabled and app password is used
   - Verify Gmail "Less secure app access" is not blocking

2. **Reset link not working:**
   - Check FRONTEND_URL is set correctly
   - Verify the token hasn't expired (1 hour limit)
   - Ensure the token is copied completely from email

3. **Password validation failing:**
   - Check password meets all requirements
   - Verify backend validation rules match frontend

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed logs for email sending and token generation.

## 🚀 Production Deployment

### Environment Variables
Ensure all production environment variables are set:
- Use production email credentials
- Set FRONTEND_URL to your production domain
- Use secure JWT_SECRET
- Set NODE_ENV=production

### Email Service
Consider using professional email services for production:
- SendGrid
- Mailgun
- AWS SES
- Postmark

### Security Considerations
- Use HTTPS for all password reset links
- Consider shorter token expiration times (15-30 minutes)
- Implement additional rate limiting in production
- Monitor for suspicious password reset activity

## 📞 Support

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple email service first (Gmail)
4. Review the email template and token generation logic

The forgot password feature is now fully integrated and ready to use! 🎉