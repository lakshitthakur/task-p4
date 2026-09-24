require('dotenv').config();

const { Resend } = require('resend');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;
const resend = new Resend(process.env.RESEND_API_KEY);
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Backend is running'
  });
});

// Newsletter subscription
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Check that an email was provided
    if (!email) {
      return res.status(400).json({
        message: 'Email address is required.'
      });
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address.'
      });
    }

    const { data, error } = await resend.emails.send({
  from: 'DEV@Deakin <onboarding@resend.dev>',
  to: [email],
  subject: 'Welcome to DEV@Deakin',
  html: `
    <h2>Welcome to DEV@Deakin!</h2>
    <p>Thank you for subscribing to our newsletter.</p>
    <p>You will receive the latest DEV@Deakin updates and news.</p>
  `,
});

if (error) {
  console.error('Resend error:', error);

  return res.status(500).json({
    message: 'Unable to send subscription email.'
  });
}

console.log('Email sent successfully:', data);

return res.status(200).json({
  message: 'Subscription successful! Check your email.'
});

  } catch (error) {
    console.error('Subscription error:', error);

    return res.status(500).json({
      message: 'Something went wrong while processing the subscription.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});