import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddCredentials.css'; // Import your CSS file for styling

const AddCredentials = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      navigate('/'); // Redirect if not admin
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!email || !password) {
      setMessage('Email and password are required.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Generate username from email (part before @)
      const username = email.split('@')[0];
      
      // Always set role as 'user' - no admin option
      const role = 'user';
      
      await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/auth/register', { 
        username, 
        email, 
        password, 
        role 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('User registered successfully!');
      setMessageType('success');
      setEmail('');
      setPassword('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details?.join(', ') || 
                          'Registration failed.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Add New User</h2>
      
      {message && (
        <div className={`message ${messageType === 'success' ? 'success' : 'error'}`} 
             style={{
               padding: '10px',
               margin: '10px 0',
               borderRadius: '4px',
               backgroundColor: messageType === 'success' ? '#e8f5e8' : '#ffebee',
               color: messageType === 'success' ? '#2e7d2e' : '#c62828',
               border: messageType === 'success' ? '1px solid #c8e6c9' : '1px solid #ffcdd2'
             }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="email">Email Address:</label>
          <input 
            type="email" 
            id="email"
            placeholder="Enter email address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={loading}
            required 
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box',
              marginBottom: '15px'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            id="password"
            placeholder="Enter password (min 8 characters)" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            disabled={loading}
            required 
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box',
              marginBottom: '15px'
            }}
          />
          <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
            Password must contain: 8+ characters, uppercase, lowercase, number, and symbol
          </small>
        </div>

        <button 
          type="submit" 
          disabled={loading || !email || !password}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: (loading || !email || !password) ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? 'Adding User...' : 'Add User'}
        </button>
      </form>
      
      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <small style={{ color: '#666' }}>
          <strong>Note:</strong> All new users are automatically assigned the "User" role. 
          Username will be generated from the email address.
        </small>
      </div>
    </div>
  );
};

export default AddCredentials;
