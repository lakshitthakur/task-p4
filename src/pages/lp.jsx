import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Verify both fields are provided
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Query the Firestore "users" collection for matching email & password
      const usersRef = collection(db, 'users');
      const authQuery = query(
        usersRef,
        where('email', '==', email.toLowerCase().trim()),
        where('password', '==', password)
      );

      const querySnapshot = await getDocs(authQuery);

      // Verify that a document was found
      if (!querySnapshot.empty) {
        // Redirection on successful authentication
        navigate('/');
      } else {
        // Clear message prompting them to check details or register
        setErrorMessage('Incorrect email or password. Please try again or sign up for a new account.');
      }
    } catch (err) {
      setErrorMessage('Authentication error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-top-action">
          <Link to="/signup" className="switch-auth-link">Sign up</Link>
        </div>

        <h2>Login</h2>

        {errorMessage && (
          <div className="auth-feedback-banner error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Your email</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Your password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;