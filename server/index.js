// Load environment variables from the .env file
require('dotenv').config();

// Import the Resend library for sending emails
const { Resend } = require('resend');

// Import Express to create the backend server
const express = require('express');

// Import CORS to allow requests from the frontend
const cors = require('cors');

// Create an Express application
const app = express();

// Define the port on which the backend server will run
const PORT = 5001;

// Create a Resend instance using the API key stored in the .env file
const resend = new Resend(process.env.RESEND_API_KEY);

// Enable CORS so the frontend can communicate with this backend
app.use(cors());

// Allow the server to receive JSON data in request bodies
app.use(express.json());

// Health check endpoint to verify that the backend is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Backend is running'
  });
});

// Handle newsletter subscription requests
app.post('/api/subscribe', async (req, res) => {
  try {
    // Get the email address submitted by the user
    const { email } = req.body;

    // Check whether an email address was provided
    if (!email) {
      return res.status(400).json({
        message: 'Email address is required.'
      });
    }

    // Basic email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check whether the provided email has a valid format
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address.'
      });
    }

    // Send a welcome email to the subscriber using Resend
    const { data, error } = await resend.emails.send({
      // Sender email address
      from: 'DEV@Deakin <onboarding@resend.dev>',

      // Email address of the subscriber
      to: [email],

      // Subject of the welcome email
      subject: 'Welcome to DEV@Deakin',

      // HTML content of the email
      html: `
        <h2>Welcome to DEV@Deakin!</h2>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You will receive the latest DEV@Deakin updates and news.</p>
      `,
    });

    // Check whether Resend returned an error
    if (error) {
      console.error('Resend error:', error);

      return res.status(500).json({
        message: 'Unable to send subscription email.'
      });
    }

    // Log successful email information
    console.log('Email sent successfully:', data);

    // Send a success response back to the frontend
    return res.status(200).json({
      message: 'Subscription successful! Check your email.'
    });

  } catch (error) {
    // Handle unexpected errors
    console.error('Subscription error:', error);

    // Return an error response to the frontend
    return res.status(500).json({
      message: 'Something went wrong while processing the subscription.'
    });
  }
});

// Start the backend server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});