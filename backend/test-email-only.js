import dotenv from 'dotenv';
import { sendPasswordResetEmail } from './utils/emailUtils.js';

dotenv.config();

const testEmailOnly = async () => {
  console.log('📧 Testing Email Configuration');
  console.log('');
  
  console.log('Environment Variables:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
  console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Using default');
  console.log('');
  
  try {
    console.log('Attempting to send password reset email...');
    
    const result = await sendPasswordResetEmail(
      'admin@pharmacy.com',
      'test-token-123',
      'admin'
    );
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message:', result.message);
    } else {
      console.log('❌ Email sending failed');
      console.log('Message:', result.message);
    }
    
  } catch (error) {
    console.log('❌ Error during email test:');
    console.log('Error:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('');
      console.log('💡 This usually means:');
      console.log('   1. Wrong email/password combination');
      console.log('   2. Gmail "Less secure app access" is disabled');
      console.log('   3. Need to use Gmail App Password instead of regular password');
      console.log('');
      console.log('🔧 To fix:');
      console.log('   1. Enable 2-Factor Authentication on Gmail');
      console.log('   2. Generate an App Password for Mail');
      console.log('   3. Use the App Password in EMAIL_PASS');
    }
  }
};

testEmailOnly();