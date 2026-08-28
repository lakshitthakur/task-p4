import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Form validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Store user record in Firestore
      await addDoc(collection(db, 'users'), {
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password,
        createdAt: new Date()
      });

      alert('Account created successfully! Please log in.');
      navigate('/login'); // Redirect to login page
    } catch (err) {
      setError('Error creating account: ' + err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Create a DEV@Deakin Account</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSignup} className="auth-form">
        <label>Name*</label>
        <input name="name" type="text" required onChange={handleChange} />

        <label>Email*</label>
        <input name="email" type="email" required onChange={handleChange} />

        <label>Password*</label>
        <input name="password" type="password" required onChange={handleChange} />

        <label>Confirm password*</label>
        <input name="confirmPassword" type="password" required onChange={handleChange} />

        <button type="submit" className="auth-btn">Create</button>
      </form>
    </div>
  );
}

export default SignupPage;