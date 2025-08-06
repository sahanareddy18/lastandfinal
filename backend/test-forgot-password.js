import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5000/api/auth';

// Test forgot password functionality
async function testForgotPassword() {
  console.log('🧪 Testing Forgot Password Functionality\n');

  try {
    // Test 1: Request password reset for existing email
    console.log('Test 1: Requesting password reset for valid email...');
    const response1 = await axios.post(`${API_BASE_URL}/forgot-password`, {
      email: 'test@example.com' // Replace with a test email from your database
    });
    console.log('✅ Response:', response1.data.message);
    console.log('');

    // Test 2: Request password reset for non-existing email
    console.log('Test 2: Requesting password reset for non-existing email...');
    const response2 = await axios.post(`${API_BASE_URL}/forgot-password`, {
      email: 'nonexistent@example.com'
    });
    console.log('✅ Response:', response2.data.message);
    console.log('');

    // Test 3: Invalid request (missing email)
    console.log('Test 3: Testing invalid request (missing email)...');
    try {
      await axios.post(`${API_BASE_URL}/forgot-password`, {});
    } catch (error) {
      console.log('✅ Expected error:', error.response.data.error);
    }
    console.log('');

    // Test 4: Test password strength check
    console.log('Test 4: Testing password strength check...');
    const response4 = await axios.post(`${API_BASE_URL}/check-password-strength`, {
      password: 'TestPassword123!'
    });
    console.log('✅ Password strength:', response4.data);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📧 Note: To fully test the forgot password flow:');
    console.log('1. Set up EMAIL_USER and EMAIL_PASS in your .env file');
    console.log('2. Use a real email address in the database');
    console.log('3. Check your email for the reset link');
    console.log('4. Use the reset link to test the reset password functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testForgotPassword();
}

export default testForgotPassword;