import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  // Auto-send reset email on component mount
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      const decodedEmail = decodeURIComponent(emailFromUrl);
      setEmail(decodedEmail);
      sendResetEmail(decodedEmail);
    } else {
      // If no email provided, redirect back to login
      setError('No email provided. Please try again from the login page.');
      setLoading(false);
    }
  }, [searchParams]);

  const sendResetEmail = async (emailAddress) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/auth/forgot-password', { 
        email: emailAddress 
      });
      
      setMessage(response.data.message);
      
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.error || 'Failed to send reset email. Please try again.');
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
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>Password Reset</h3>
      
      {loading && (
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ 
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            marginBottom: '15px'
          }} className="spinner"></div>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Sending password reset link to <strong>{email}</strong>...
          </p>
        </div>
      )}
      
      {error && (
        <div>
          <div style={{ 
            padding: '15px', 
            marginBottom: '20px', 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            borderRadius: '4px',
            border: '1px solid #ffcdd2',
            textAlign: 'center'
          }}>
            <strong>❌ Error</strong><br />
            {error}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link 
              to="/login" 
              style={{ 
                color: '#007bff', 
                textDecoration: 'none',
                fontSize: '16px',
                padding: '10px 20px',
                border: '1px solid #007bff',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      )}

      {message && (
        <div>
          <div style={{ 
            padding: '15px', 
            marginBottom: '20px', 
            backgroundColor: '#e8f5e8', 
            color: '#2e7d2e', 
            borderRadius: '4px',
            border: '1px solid #c8e6c9',
            textAlign: 'center'
          }}>
            <strong>✅ Success</strong><br />
            {message}
          </div>
          <p style={{ 
            textAlign: 'center', 
            marginBottom: '20px', 
            color: '#666', 
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Please check your email inbox and click the reset link to continue.
          </p>
          <div style={{ textAlign: 'center' }}>
            <Link 
              to="/login" 
              style={{ 
                color: '#007bff', 
                textDecoration: 'none',
                fontSize: '16px',
                padding: '10px 20px',
                border: '1px solid #007bff',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .spinner {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default ForgotPassword;
