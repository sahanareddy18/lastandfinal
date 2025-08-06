import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Diagnosing Backend Configuration Issues\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('- PORT:', process.env.PORT || 'Not set (will use 5000)');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET ❌');
console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET ❌');
console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET ❌');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set (will use default)');
console.log('');

// Check if .env file exists
import { existsSync } from 'fs';
console.log('📁 File Check:');
console.log('- .env file exists:', existsSync('.env') ? 'Yes ✅' : 'No ❌');
console.log('');

// Test MongoDB connection
console.log('🗄️ Testing MongoDB Connection...');
import mongoose from 'mongoose';

const testMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/pharmacy_management';
    console.log('- Attempting to connect to:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    
    console.log('- MongoDB connection: Success ✅');
    await mongoose.disconnect();
  } catch (error) {
    console.log('- MongoDB connection: Failed ❌');
    console.log('- Error:', error.message);
  }
};

// Test email configuration
console.log('📧 Testing Email Configuration...');
import nodemailer from 'nodemailer';

const testEmail = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('- Email config: Missing EMAIL_USER or EMAIL_PASS ❌');
      return;
    }

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();
    console.log('- Email configuration: Valid ✅');
  } catch (error) {
    console.log('- Email configuration: Invalid ❌');
    console.log('- Error:', error.message);
  }
};

// Run all tests
const runDiagnostics = async () => {
  await testMongoDB();
  await testEmail();
  
  console.log('\n🔧 Quick Fix Instructions:');
  
  if (!existsSync('.env')) {
    console.log('1. Create a .env file in the backend directory');
    console.log('2. Copy the contents from env.example');
    console.log('3. Update the values with your actual configuration');
  }
  
  if (!process.env.MONGODB_URI) {
    console.log('4. Set MONGODB_URI in your .env file');
    console.log('   Example: MONGODB_URI=mongodb://localhost:27017/pharmacy_management');
  }
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('5. Set EMAIL_USER and EMAIL_PASS in your .env file');
    console.log('   Example: EMAIL_USER=your-email@gmail.com');
    console.log('   Example: EMAIL_PASS=your-gmail-app-password');
  }
  
  console.log('\n✨ After creating .env file, restart the server with: npm start');
};

runDiagnostics();