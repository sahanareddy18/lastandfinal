import React, { useState } from 'react';
import axios from 'axios';
import './ChangeCredentials.css';

const ChangeAdminCredentials = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);

  // No need to fetch admins list anymore since we're using email input

  const handleResetPassword = async () => {
    if (!email) {
      setMessage('Email is required');
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

    setLoading(true);
    setMessage('');

    try {
      // First, check if the email belongs to an admin
      const adminCheckResponse = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/auth/check-admin-email', {
        email: email
      });

      if (!adminCheckResponse.data.isAdmin) {
        setMessage('This email is not associated with an admin account');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // If email belongs to admin, send password reset email
      const response = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/auth/forgot-password', {
        email: email
      });

      setMessage('Password reset link has been sent to the admin email address. Please check your inbox.');
      setMessageType('success');
      
      // Clear form
      setEmail('');
      
    } catch (error) {
      console.error('Reset error:', error);
      const errorMessage = error.response?.data?.error || 
                          'Failed to send password reset email';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cred-container">
      <h2 className="title">Send Admin Password Reset</h2>
      
      {message && (
        <div className={`message ${messageType === 'success' ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="form-group">
        <label>Admin Email</label>
        <input
          type="email"
          placeholder="Enter admin email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
          Only emails associated with admin accounts can receive password reset links.
        </small>
      </div>

      <button 
        onClick={handleResetPassword} 
        disabled={loading || !email}
        style={{ 
          opacity: (loading || !email) ? 0.6 : 1,
          cursor: (loading || !email) ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
      </button>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>How it works:</h4>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
          <li>Enter the admin's email address</li>
          <li>System verifies the email belongs to an admin account</li>
          <li>Password reset link is sent to the admin's email</li>
          <li>Admin can click the link to set a new password</li>
        </ol>
      </div>
    </div>
  );
};

export default ChangeAdminCredentials;
