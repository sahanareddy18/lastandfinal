import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, username) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Password Reset Request - Pharmacy Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
          <h1>🔐 Password Reset Request</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <h2>Hello ${username},</h2>
          
          <p>We received a request to reset your password for the Pharmacy Management System.</p>
          
          <p>If you didn't make this request, please ignore this email.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #28a745; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire in 1 hour</li>
            <li>If the button doesn't work, copy and paste this link: ${resetUrl}</li>
            <li>For security reasons, this link can only be used once</li>
          </ul>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>
          Pharmacy Management System Team</p>
        </div>
        
        <div style="background-color: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: 'Failed to send password reset email' };
  }
};

// Send welcome email for new users
export const sendWelcomeEmail = async (email, username) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Welcome to Pharmacy Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
          <h1>🎉 Welcome to Pharmacy Management System</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <h2>Hello ${username},</h2>
          
          <p>Welcome to the Pharmacy Management System! Your account has been successfully created.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Manage inventory and stock</li>
            <li>Process sales and invoices</li>
            <li>Track customer information</li>
            <li>Generate reports and analytics</li>
            <li>Use the AI chatbot for assistance</li>
          </ul>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>
          Pharmacy Management System Team</p>
        </div>
        
        <div style="background-color: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Welcome email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: 'Failed to send welcome email' };
  }
};

// Send account lock notification
export const sendAccountLockEmail = async (email, username, lockDuration) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Account Temporarily Locked - Pharmacy Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
          <h1>🔒 Account Temporarily Locked</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <h2>Hello ${username},</h2>
          
          <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
          
          <p><strong>Lock Duration:</strong> ${lockDuration}</p>
          
          <p>This is a security measure to protect your account. You can try logging in again after the lock period expires.</p>
          
          <p>If you believe this was done in error or need immediate assistance, please contact our support team.</p>
          
          <p>Best regards,<br>
          Pharmacy Management System Team</p>
        </div>
        
        <div style="background-color: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Account lock notification sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: 'Failed to send account lock notification' };
  }
}; 