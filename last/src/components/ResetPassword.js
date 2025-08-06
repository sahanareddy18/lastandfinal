import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      setError('Invalid or missing reset token');
      return;
    }
    setToken(resetToken);
  }, [searchParams]);

  // Check password strength
  const checkPasswordStrength = async (password) => {
    if (!password) {
      setPasswordStrength({});
      return;
    }

    try {
      const response = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/auth/check-password-strength', {
        password
      });
      setPasswordStrength(response.data);
    } catch (error) {
      console.error('Password strength check error:', error);
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    checkPasswordStrength(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check password strength
    if (!passwordStrength.isValid) {
      setError('Password does not meet security requirements');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/auth/reset-password', { 
        token,
        newPassword 
      });
      
      setMessage(response.data.message);
      
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.response?.data?.details) {
        setError(`${error.response.data.error}: ${error.response.data.details.join(', ')}`);
      } else {
        setError(error.response?.data?.error || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength) => {
    if (strength >= 80) return '#4caf50'; // Green
    if (strength >= 60) return '#ff9800'; // Orange
    if (strength >= 40) return '#ff5722'; // Red-orange
    return '#f44336'; // Red
  };

  if (!token) {
    return (
      <div style={{ 
        maxWidth: '400px', 
        margin: '50px auto', 
        padding: '30px', 
        border: '1px solid #ccc', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#f44336', marginBottom: '20px' }}>Invalid Reset Link</h3>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          This password reset link is invalid or has expired.
        </p>
        <Link 
          to="/forgot-password" 
          style={{ 
            color: '#007bff', 
            textDecoration: 'none',
            fontSize: '16px'
          }}
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

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
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>Reset Password</h3>
      
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

      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          backgroundColor: '#e8f5e8', 
          color: '#2e7d2e', 
          borderRadius: '4px',
          border: '1px solid #c8e6c9'
        }}>
          {message}
          <br />
          <small>Redirecting to login page in 3 seconds...</small>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            New Password:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              placeholder="Enter new password"
              value={newPassword}
              onChange={handlePasswordChange}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box',
                paddingRight: '40px'
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#666'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {newPassword && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '5px'
              }}>
                <span style={{ fontSize: '12px', color: '#666' }}>Password Strength:</span>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  color: getStrengthColor(passwordStrength.strength || 0)
                }}>
                  {passwordStrength.label || 'Checking...'}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#e0e0e0',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${passwordStrength.strength || 0}%`,
                  height: '100%',
                  backgroundColor: getStrengthColor(passwordStrength.strength || 0),
                  transition: 'width 0.3s ease'
                }} />
              </div>
              {passwordStrength.errors && passwordStrength.errors.length > 0 && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#f44336', 
                  marginTop: '5px' 
                }}>
                  {passwordStrength.errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {confirmPassword && newPassword !== confirmPassword && (
            <div style={{ 
              fontSize: '12px', 
              color: '#f44336', 
              marginTop: '5px' 
            }}>
              Passwords do not match
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading || !passwordStrength.isValid || newPassword !== confirmPassword}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: (loading || !passwordStrength.isValid || newPassword !== confirmPassword) ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '16px',
            cursor: (loading || !passwordStrength.isValid || newPassword !== confirmPassword) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
            marginBottom: '15px'
          }}
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <Link 
            to="/login" 
            style={{ 
              color: '#007bff', 
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
