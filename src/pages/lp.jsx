import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';

function LoginPage() {

  // Local state for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Authentication context and navigation
  const { login } = useAuth();
  const navigate = useNavigate();


  // ----------------------------------------------------------
  // HANDLE LOGIN
  // ----------------------------------------------------------

  const handleLoginSubmit = async (e) => {

    e.preventDefault();

    setErrorMessage('');

    // Validate input
    if (!email.trim() || !password) {

      setErrorMessage(
        'Please provide both your email and password.'
      );

      return;
    }

    setIsLoading(true);


    try {

      // ------------------------------------------------------
      // FIREBASE AUTHENTICATION
      // ------------------------------------------------------

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );


      // Firebase authenticated user
      const firebaseUser = userCredential.user;


      // ------------------------------------------------------
      // GET USER PROFILE FROM FIRESTORE
      // ------------------------------------------------------

      const userRef = doc(
        db,
        'users',
        firebaseUser.uid
      );

      const userSnapshot = await getDoc(userRef);


      // ------------------------------------------------------
      // CHECK USER PROFILE
      // ------------------------------------------------------

      if (!userSnapshot.exists()) {

        setErrorMessage(
          'Your Firebase account exists, but your DEV@Deakin user profile was not found.'
        );

        return;
      }


      // Get Firestore user information
      const firestoreUser = userSnapshot.data();


      // ------------------------------------------------------
      // CREATE USER OBJECT
      // ------------------------------------------------------

      const userData = {

        // Firebase UID
        id: firebaseUser.uid,

        // Firebase email
        email: firebaseUser.email,

        // Other Firestore user information
        ...firestoreUser,

        // Default subscription plan
        subscriptionPlan:
          firestoreUser.subscriptionPlan || 'Free'

      };


      // ------------------------------------------------------
      // SAVE USER IN AUTH CONTEXT
      // ------------------------------------------------------

      login(userData);


      // ------------------------------------------------------
      // REDIRECT
      // ------------------------------------------------------

      navigate('/');


    } catch (err) {

      console.error(
        'Firebase login error:',
        err
      );


      // Firebase authentication errors
      if (err.code === 'auth/invalid-credential') {

        setErrorMessage(
          'Incorrect email or password. Please try again.'
        );

      } else if (err.code === 'auth/user-not-found') {

        setErrorMessage(
          'No account was found with this email address.'
        );

      } else if (err.code === 'auth/wrong-password') {

        setErrorMessage(
          'Incorrect password. Please try again.'
        );

      } else if (err.code === 'auth/invalid-email') {

        setErrorMessage(
          'Please enter a valid email address.'
        );

      } else {

        setErrorMessage(
          'Authentication error: ' + err.message
        );

      }

    } finally {

      setIsLoading(false);

    }

  };


  // ----------------------------------------------------------
  // JSX
  // ----------------------------------------------------------

  return (

    <div className="auth-wrapper">

      <div className="auth-card">


        {/* Sign up link */}

        <div className="auth-top-action">

          <Link
            to="/signup"
            className="switch-auth-link"
          >
            Sign up
          </Link>

        </div>


        <h2>Login</h2>


        {/* Error message */}

        {errorMessage && (

          <div className="auth-feedback-banner error">

            {errorMessage}

          </div>

        )}


        <form
          onSubmit={handleLoginSubmit}
          className="auth-form"
          noValidate
        >


          {/* Email */}

          <div className="form-group">

            <label htmlFor="login-email">
              Your email
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>


          {/* Password */}

          <div className="form-group">

            <label htmlFor="login-password">
              Your password
            </label>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>


          {/* Login button */}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >

            {isLoading
              ? 'Signing in...'
              : 'Login'
            }

          </button>

        </form>

      </div>

    </div>

  );

}

export default LoginPage;