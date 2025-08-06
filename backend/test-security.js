import { validatePassword, getPasswordStrength, getPasswordStrengthLabel } from './utils/passwordUtils.js';

console.log('🔐 Testing Security Features');
console.log('============================\n');

// Test 1: Weak password
console.log('Test 1: Weak password "weak"');
const weakPassword = validatePassword('weak');
console.log('Validation result:', weakPassword);
console.log('Strength score:', getPasswordStrength('weak'));
console.log('Strength label:', getPasswordStrengthLabel(getPasswordStrength('weak')));
console.log('');

// Test 2: Medium password
console.log('Test 2: Medium password "Password123"');
const mediumPassword = validatePassword('Password123');
console.log('Validation result:', mediumPassword);
console.log('Strength score:', getPasswordStrength('Password123'));
console.log('Strength label:', getPasswordStrengthLabel(getPasswordStrength('Password123')));
console.log('');

// Test 3: Strong password
console.log('Test 3: Strong password "SecurePass123!"');
const strongPassword = validatePassword('SecurePass123!');
console.log('Validation result:', strongPassword);
console.log('Strength score:', getPasswordStrength('SecurePass123!'));
console.log('Strength label:', getPasswordStrengthLabel(getPasswordStrength('SecurePass123!')));
console.log('');

// Test 4: Very weak password
console.log('Test 4: Very weak password "123"');
const veryWeakPassword = validatePassword('123');
console.log('Validation result:', veryWeakPassword);
console.log('Strength score:', getPasswordStrength('123'));
console.log('Strength label:', getPasswordStrengthLabel(getPasswordStrength('123')));
console.log('');

console.log('✅ Password validation tests completed!');
console.log('\n📋 Expected Results:');
console.log('- Weak passwords should show validation errors');
console.log('- Strong passwords should pass validation');
console.log('- Strength scores should range from 0-100');
console.log('- Account locking will work when server is running with MongoDB'); 