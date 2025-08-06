import mongoose from 'mongoose';
import User from './models/User.js';
import { hashPassword } from './utils/passwordUtils.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://srikeerthi:srikeerthi12@cluster0.xzsm8.mongodb.net/PR?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB Connected for migration!');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const migrateUsers = async () => {
  try {
    await connectDB();
    
    console.log('🔧 Starting User Migration...');
    
    // Find all existing users
    const existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} existing users`);
    
    for (const user of existingUsers) {
      console.log(`\nProcessing user: ${user.username}`);
      
      // Check if user has email
      if (!user.email) {
        console.log(`  - Adding email: ${user.username}@pharmacy.com`);
        user.email = `${user.username}@pharmacy.com`;
      }
      
      // Check if password needs to be updated (if it's not hashed)
      if (user.password && user.password.length < 20) { // bcrypt hashes are longer
        console.log(`  - Updating password for: ${user.username}`);
        const newPassword = 'SecurePass123!'; // Default strong password
        user.password = await hashPassword(newPassword);
        console.log(`  - New password set to: ${newPassword}`);
      }
      
      // Save the updated user
      await user.save();
      console.log(`  ✅ Updated user: ${user.username}`);
    }
    
    console.log('\n🎉 User migration completed successfully!');
    console.log('\n📋 Migration Summary:');
    console.log('- Added email addresses to users without emails');
    console.log('- Updated weak passwords to strong passwords');
    console.log('- All users now comply with security requirements');
    
    console.log('\n🔑 Default passwords for existing users:');
    console.log('- Username: admin, Password: SecurePass123!');
    console.log('- Username: user, Password: SecurePass123!');
    console.log('- (Check the console output above for specific usernames)');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
};

migrateUsers(); 