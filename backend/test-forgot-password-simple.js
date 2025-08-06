import axios from 'axios';

const testForgotPassword = async () => {
  console.log('🧪 Testing Forgot Password Endpoint');
  console.log('');

  try {
    // Test the forgot password endpoint
    console.log('Testing POST /api/auth/forgot-password...');
    
    const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email: 'admin@pharmacy.com'
    });
    
    console.log('✅ Success:', response.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🔍 Issue: Backend server is not running');
      console.log('💡 Solution: Start the server with: npm start');
    } else if (error.response?.status === 500) {
      console.log('🔍 Issue: Internal server error');
      console.log('💡 Possible causes:');
      console.log('   - Database connection issue');
      console.log('   - Email configuration problem');
      console.log('   - Missing environment variables');
    }
  }
};

testForgotPassword();