import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/pharmacy_management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin user exists
    console.log('🔍 Checking for admin user with email: admin@pharmacy.com');
    
    const adminUser = await User.findOne({ email: 'admin@pharmacy.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('  - Username:', adminUser.username);
      console.log('  - Email:', adminUser.email);
      console.log('  - Role:', adminUser.role);
      console.log('  - Active:', adminUser.isActive);
    } else {
      console.log('❌ No admin user found with email: admin@pharmacy.com');
      console.log('');
      console.log('📝 Available users:');
      
      const allUsers = await User.find({}, 'username email role isActive');
      if (allUsers.length === 0) {
        console.log('   No users found in database');
        console.log('');
        console.log('💡 Solution: Create an admin user first');
        console.log('   You can use the registration endpoint or create one manually');
      } else {
        allUsers.forEach(user => {
          console.log(`   - ${user.email} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`);
        });
      }
    }

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error:', error);
  }
};

checkAdminUser();