import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5000/api/auth';

// Test email-based login functionality
async function testEmailLogin() {
  console.log('🧪 Testing Email-Based Login Functionality\n');

  try {
    // Test 1: Check admin email
    console.log('Test 1: Checking if email belongs to admin...');
    const adminCheckResponse = await axios.post(`${API_BASE_URL}/check-admin-email`, {
      email: 'admin@pharmacy.com' // Replace with your admin email
    });
    console.log('✅ Admin check result:', adminCheckResponse.data);
    console.log('');

    // Test 2: Check non-admin email
    console.log('Test 2: Checking if email belongs to non-admin...');
    const userCheckResponse = await axios.post(`${API_BASE_URL}/check-admin-email`, {
      email: 'user@pharmacy.com' // Replace with your user email
    });
    console.log('✅ User check result:', userCheckResponse.data);
    console.log('');

    // Test 3: Check non-existent email
    console.log('Test 3: Checking non-existent email...');
    const nonExistentResponse = await axios.post(`${API_BASE_URL}/check-admin-email`, {
      email: 'nonexistent@pharmacy.com'
    });
    console.log('✅ Non-existent email result:', nonExistentResponse.data);
    console.log('');

    // Test 4: Try login with email (replace with valid credentials)
    console.log('Test 4: Testing email-based login...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
        email: 'admin@pharmacy.com', // Replace with valid admin email
        password: 'YourPassword123!' // Replace with valid password
      });
      console.log('✅ Login successful:', {
        role: loginResponse.data.role,
        username: loginResponse.data.user.username,
        email: loginResponse.data.user.email
      });
    } catch (loginError) {
      console.log('⚠️  Login failed (expected if credentials are invalid):', 
        loginError.response?.data?.error || loginError.message);
    }
    console.log('');

    console.log('🎉 All tests completed!');
    console.log('\n📝 Frontend Behavior:');
    console.log('- Login form now uses email instead of username');
    console.log('- "Forgot Password" link only appears when typing an admin email');
    console.log('- Works for both admin and salesman roles');
    console.log('- Real-time email checking with 500ms debounce');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailLogin();
}

export default testEmailLogin;