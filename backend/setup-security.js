import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Pharmacy Management System - Security Setup');
console.log('==============================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
} else {
  console.log('❌ .env file not found');
  console.log('\n📝 Creating .env file with default values...');
  
  const defaultEnvContent = `# Database Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=24h

# Email Configuration (for password reset and notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5000
NODE_ENV=development

# Security Configuration
BCRYPT_SALT_ROUNDS=12
PASSWORD_RESET_EXPIRY=3600000
ACCOUNT_LOCK_DURATION=900000
MAX_LOGIN_ATTEMPTS=5
`;

  try {
    fs.writeFileSync(envPath, defaultEnvContent);
    console.log('✅ .env file created successfully');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    console.log('\n📝 Please create a .env file manually with the following content:');
    console.log(defaultEnvContent);
  }
}

console.log('\n🔧 Configuration Instructions:');
console.log('=============================');
console.log('\n1. 📧 Email Setup (Optional):');
console.log('   - For Gmail: Enable 2FA and generate an App Password');
console.log('   - Update EMAIL_USER and EMAIL_PASS in .env file');
console.log('   - Or leave as placeholder values for now');

console.log('\n2. 🔑 JWT Secret:');
console.log('   - Update JWT_SECRET in .env file with a strong secret');
console.log('   - You can generate one using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');

console.log('\n3. 🗄️ Database:');
console.log('   - Update MONGODB_URI with your MongoDB connection string');
console.log('   - Or keep using your existing MONGO_URI if it works');

console.log('\n4. 🚀 Start the server:');
console.log('   - Run: npm start or node server.js');

console.log('\n5. 🧪 Test the security features:');
console.log('   - Register a new user: POST /api/auth/register');
console.log('   - Login: POST /api/auth/login');
console.log('   - Check password strength: POST /api/auth/check-password-strength');

console.log('\n📋 Security Features Available:');
console.log('==============================');
console.log('✅ Password hashing with bcrypt');
console.log('✅ Strong password policy enforcement');
console.log('✅ JWT token authentication');
console.log('✅ Rate limiting for login attempts');
console.log('✅ Account locking after failed attempts');
console.log('✅ Password reset via email (when configured)');
console.log('✅ Password strength validation');
console.log('✅ Secure password generation');

console.log('\n⚠️  Important Notes:');
console.log('===================');
console.log('- Existing users will continue to work with old passwords');
console.log('- New users will automatically use the secure password system');
console.log('- Email features require proper email configuration');
console.log('- Change JWT_SECRET in production for security');

console.log('\n🎉 Setup complete! Your security system is ready to use.'); 