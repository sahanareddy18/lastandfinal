import axios from 'axios';

const testPasswordChange = async () => {
  console.log('🧪 Testing Email-Based Password Change');
  console.log('');

  try {
    // Test 1: Admin password reset (no current password required)
    console.log('Test 1: Admin password reset...');
    const response1 = await axios.post('http://localhost:5000/api/auth/change-password', {
      email: 'admin@pharmacy.com',
      newPassword: 'NewAdminPassword123!'
      // No currentPassword provided - admin override
    });
    console.log('✅ Admin password reset:', response1.data.message);
    console.log('');

    // Test 2: User password change (with current password)
    console.log('Test 2: User password change with current password...');
    try {
      const response2 = await axios.post('http://localhost:5000/api/auth/change-password', {
        email: 'user@pharmacy.com',
        currentPassword: 'wrongpassword',
        newPassword: 'NewUserPassword123!'
      });
      console.log('✅ User password change:', response2.data.message);
    } catch (error) {
      console.log('⚠️  Expected error for wrong current password:', error.response?.data?.error);
    }
    console.log('');

    // Test 3: Invalid email
    console.log('Test 3: Invalid email test...');
    try {
      const response3 = await axios.post('http://localhost:5000/api/auth/change-password', {
        email: 'nonexistent@pharmacy.com',
        newPassword: 'NewPassword123!'
      });
      console.log('✅ Response:', response3.data.message);
    } catch (error) {
      console.log('⚠️  Expected error for non-existent user:', error.response?.data?.error);
    }
    console.log('');

    console.log('🎉 Password change tests completed!');
    console.log('');
    console.log('💡 Frontend Usage:');
    console.log('- ChangeAdminCredentials: Email + New Password (no current password needed)');
    console.log('- ChangeCredentials: Email + New Password (admin can reset any user)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testPasswordChange();