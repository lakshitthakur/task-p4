import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function SignupPage() {
  // Store form input fields locally
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // State handles for dynamic UI feedback banners
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Track and update form field changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Perform full client-side field validation before sending to Firestore
  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('All fields marked with an asterisk (*) are required.');
      return false;
    }

    // Basic RFC email format checking
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('Please provide a valid email address (e.g., user@example.com).');
      return false;
    }

    // Enforce password security constraints
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }

    // Confirm passwords match exactly
    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return false;
    }

    return true;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Abort if client validation fails
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. Query Firestore to ensure this email is not already registered
      const usersRef = collection(db, 'users');
      const emailQuery = query(usersRef, where('email', '==', formData.email.toLowerCase().trim()));
      const duplicateSnapshot = await getDocs(emailQuery);

      if (!duplicateSnapshot.empty) {
        setErrorMessage('An account with this email already exists. Please login instead.');
        setIsSubmitting(false);
        return;
      }

      // 2. Add user document to Firestore "users" collection
      await addDoc(collection(db, 'users'), {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password, // Frontend-level per current assignment scope
        createdAt: new Date().toISOString()
      });

      // 3. Inform user and automatically redirect to the login page
      navigate('/login');
    } catch (err) {
      setErrorMessage('Registration error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-top-action">
          <Link to="/login" className="switch-auth-link">Login instead</Link>
        </div>

        <h2>Create a DEV@Deakin Account</h2>

        {errorMessage && (
          <div className="auth-feedback-banner error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSignupSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Name*</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="First and Last name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g., alex@deakin.edu.au"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password*</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;