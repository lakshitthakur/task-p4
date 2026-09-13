import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  // Local state for tracking form input values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state for managing error feedback and loading indicators
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Authentication context and navigation hooks
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles submission: performs input validation, queries Firestore for matching
   * credentials, stores the user session via AuthContext, and redirects to home.
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Ensure mandatory input fields are filled before submitting
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Query the Firestore 'users' collection for a document matching the entered email and password
      const usersRef = collection(db, 'users');
      const authQuery = query(
        usersRef,
        where('email', '==', email.toLowerCase().trim()),
        where('password', '==', password)
      );

      const querySnapshot = await getDocs(authQuery);

      // Check if a matching user document was returned
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = {
          id: userDoc.id,
          ...userDoc.data(),
          // Default to Free plan if subscriptionPlan is not set in Firestore
          subscriptionPlan: userDoc.data().subscriptionPlan || 'Free'
        };

        // Save authenticated user data into global state and localStorage
        login(userData);

        // Redirect user to the home page upon successful authentication
        navigate('/');
      } else {
        // Return clear user feedback if credentials do not match
        setErrorMessage('Incorrect email or password. Please try again or sign up for a new account.');
      }
    } catch (err) {
      // Catch and display any Firestore or network issues
      setErrorMessage('Authentication error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Navigation link to direct unregistered users to the sign-up page */}
        <div className="auth-top-action">
          <Link to="/signup" className="switch-auth-link">Sign up</Link>
        </div>

        <h2>Login</h2>

        {/* Dynamic error display banner */}
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