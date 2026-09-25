import React, { useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { createUserWithEmailAndPassword } from 'firebase/auth';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../firebase';

function SignupPage() {

  // Store form input fields locally
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // UI feedback
  const [errorMessage, setErrorMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();


  // ----------------------------------------------------------
  // HANDLE INPUT CHANGES
  // ----------------------------------------------------------

  const handleInputChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  // ----------------------------------------------------------
  // VALIDATE FORM
  // ----------------------------------------------------------

  const validateForm = () => {

    const {
      name,
      email,
      password,
      confirmPassword
    } = formData;


    // Check required fields
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {

      setErrorMessage(
        'All fields marked with an asterisk (*) are required.'
      );

      return false;

    }


    // Validate email
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {

      setErrorMessage(
        'Please provide a valid email address.'
      );

      return false;

    }


    // Validate password length
    if (password.length < 6) {

      setErrorMessage(
        'Password must be at least 6 characters long.'
      );

      return false;

    }


    // Confirm password
    if (password !== confirmPassword) {

      setErrorMessage(
        'Password and Confirm Password do not match.'
      );

      return false;

    }


    return true;

  };


  // ----------------------------------------------------------
  // SIGN UP
  // ----------------------------------------------------------

  const handleSignupSubmit = async (e) => {

    e.preventDefault();

    setErrorMessage('');


    // Run validation
    if (!validateForm()) {
      return;
    }


    setIsSubmitting(true);


    try {

      const email =
        formData.email.trim().toLowerCase();


      // ------------------------------------------------------
      // CREATE FIREBASE AUTHENTICATION ACCOUNT
      // ------------------------------------------------------

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          formData.password
        );


      // Firebase Authentication user
      const firebaseUser =
        userCredential.user;


      // ------------------------------------------------------
      // CREATE FIRESTORE USER PROFILE
      // ------------------------------------------------------

      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        {

          // User's name
          name: formData.name.trim(),

          // User's email
          email: email,

          // Default subscription plan
          subscriptionPlan: 'Free',

          // Account creation time
          createdAt: serverTimestamp()

        }
      );


      // ------------------------------------------------------
      // REDIRECT TO LOGIN
      // ------------------------------------------------------

      navigate('/login');


    } catch (err) {

      console.error(
        'Registration error:',
        err
      );


      // Email already registered
      if (
        err.code === 'auth/email-already-in-use'
      ) {

        setErrorMessage(
          'An account with this email already exists. Please login instead.'
        );

      }

      // Invalid email
      else if (
        err.code === 'auth/invalid-email'
      ) {

        setErrorMessage(
          'Please provide a valid email address.'
        );

      }

      // Weak password
      else if (
        err.code === 'auth/weak-password'
      ) {

        setErrorMessage(
          'Password must be at least 6 characters long.'
        );

      }

      // General Firebase error
      else {

        setErrorMessage(
          'Registration error: ' + err.message
        );

      }

    } finally {

      setIsSubmitting(false);

    }

  };


  // ----------------------------------------------------------
  // JSX
  // ----------------------------------------------------------

  return (

    <div className="auth-wrapper">

      <div className="auth-card">


        {/* Login link */}

        <div className="auth-top-action">

          <Link
            to="/login"
            className="switch-auth-link"
          >
            Login instead
          </Link>

        </div>


        <h2>
          Create a DEV@Deakin Account
        </h2>


        {/* Error message */}

        {errorMessage && (

          <div className="auth-feedback-banner error">

            {errorMessage}

          </div>

        )}


        <form
          onSubmit={handleSignupSubmit}
          className="auth-form"
          noValidate
        >


          {/* Name */}

          <div className="form-group">

            <label htmlFor="name">
              Name*
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="First and Last name"
              value={formData.name}
              onChange={handleInputChange}
            />

          </div>


          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email*
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g., alex@deakin.edu.au"
              value={formData.email}
              onChange={handleInputChange}
            />

          </div>


          {/* Password */}

          <div className="form-group">

            <label htmlFor="password">
              Password*
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleInputChange}
            />

          </div>


          {/* Confirm password */}

          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm password*
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >

            {isSubmitting
              ? 'Creating account...'
              : 'Create'
            }

          </button>

        </form>

      </div>

    </div>

  );

}

export default SignupPage;