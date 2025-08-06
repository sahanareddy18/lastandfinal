import React, { useState } from 'react';
import axios from 'axios';
import './ChangeCredentials.css';

const ChangeCredentials = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);

  // No need to fetch users list anymore since we're using email input

  const handleUpdate = async () => {
    if (!email || !newPassword) {
      setMessage('Email and password are required');
      setMessageType('error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/auth/change-password', {
        email: email,
        currentPassword: '', // Not needed for admin reset
        newPassword: newPassword
      });

      setMessage('Password updated successfully!');
      setMessageType('success');
      
      // Clear form
      setEmail('');
      setNewPassword('');
      
    } catch (error) {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details?.join(', ') || 
                          'Failed to update password';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cred-container">
      <h2 className="title">Change User Password</h2>
      
      {message && (
        <div className={`message ${messageType === 'success' ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="form-group">
        <label>User Email</label>
        <input
          type="email"
          placeholder="Enter user email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>New Password</label>
        <input
          type="password"
          placeholder="New Password (min 8 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
        />
        <small style={{ color: '#666', fontSize: '12px' }}>
          Password must contain: 8+ characters, uppercase, lowercase, number, and symbol
        </small>
      </div>

      <button 
        onClick={handleUpdate} 
        disabled={loading || !email || !newPassword}
        style={{ 
          opacity: (loading || !email || !newPassword) ? 0.6 : 1,
          cursor: (loading || !email || !newPassword) ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </div>
  );
};

export default ChangeCredentials;
