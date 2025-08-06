import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      clearTimeout(window.emailCheckTimeout);
    };
  }, []);

  // Check if email belongs to admin (to show forgot password option)
  const checkAdminEmail = async (emailValue) => {
    if (!emailValue || !emailValue.includes('@')) {
      setShowForgotPassword(false);
      return;
    }

    try {
      const response = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/auth/check-admin-email', {
        email: emailValue
      });
      setShowForgotPassword(response.data.isAdmin);
    } catch (error) {
      // If error, don't show forgot password option
      setShowForgotPassword(false);
    }
  };

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    
    // Debounce the admin check to avoid too many API calls
    clearTimeout(window.emailCheckTimeout);
    window.emailCheckTimeout = setTimeout(() => {
      checkAdminEmail(emailValue);
    }, 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/auth/login', { 
        email, 
        password 
      });
      
      // Store authentication data (simplified)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('userId', response.data.user.id);
      
      // Redirect based on role
      navigate(response.data.role === 'admin' ? '/admin' : '/user');
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '50px auto', 
      padding: '30px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      backgroundColor: 'white'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Pharmacy Management System</h2>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>Login</h3>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email address"
            value={email}
            onChange={handleEmailChange}
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Password:
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
            marginBottom: '15px'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {showForgotPassword && (
          <div style={{ textAlign: 'center' }}>
            <Link 
              to={`/forgot-password?email=${encodeURIComponent(email)}`}
              style={{ 
                color: '#007bff', 
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Forgot your password?
            </Link>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
