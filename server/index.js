// Load environment variables from the .env file
require('dotenv').config();

// Import the Resend library for sending emails
const { Resend } = require('resend');

// Import Express to create the backend server
const express = require('express');

// Import CORS to allow requests from the frontend
const cors = require('cors');

// Import Firebase Admin authentication
const { getAuth } = require('firebase-admin/auth');

// Import the Firestore database
const { db } = require('./firebaseAdmin');

// Create an Express application
const app = express();

// Define the port on which the backend will run
const PORT = process.env.PORT || 5001;

// Create a Resend instance using the API key stored in the .env file
const resend = new Resend(process.env.RESEND_API_KEY);

// Enable CORS so the frontend can communicate with this backend
app.use(cors());

// Allow the server to receive JSON data in request bodies
app.use(express.json());


// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Backend is running'
  });
});


// ============================================================
// NEWSLETTER SUBSCRIPTION
// ============================================================

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

    // Send a welcome email using Resend
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

    // Check whether Resend returned an error
    if (error) {
      console.error('Resend error:', error);

      return res.status(500).json({
        message: 'Unable to send subscription email.'
      });
    }

    // Log successful email information
    console.log('Email sent successfully:', data);

    // Send a success response
    return res.status(200).json({
      message: 'Subscription successful! Check your email.'
    });

  } catch (error) {

    // Handle unexpected errors
    console.error('Subscription error:', error);

    return res.status(500).json({
      message: 'Something went wrong while processing the subscription.'
    });
  }
});


// ============================================================
// CREATE POST
// ============================================================

app.post('/api/posts', async (req, res) => {

  try {

    // --------------------------------------------------------
    // 1. CHECK AUTHENTICATION
    // --------------------------------------------------------

    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        message: 'You must be logged in to create a post.'
      });
    }

    // Check that the Authorization header uses Bearer authentication
    if (!authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Invalid authentication format.'
      });
    }

    // Extract the Firebase ID token
    const idToken = authorizationHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({
        message: 'Authentication token is missing.'
      });
    }

    // Verify the Firebase ID token using Firebase Admin SDK
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Firebase user ID
    const userId = decodedToken.uid;

    console.log('Authenticated user:', userId);


    // --------------------------------------------------------
    // 2. GET USER INFORMATION
    // --------------------------------------------------------

    const userDocument = await db
      .collection('users')
      .doc(userId)
      .get();

    if (!userDocument.exists) {
      return res.status(404).json({
        message: 'User profile was not found.'
      });
    }

    const userData = userDocument.data();

    // Get subscription plan from Firestore
    const subscriptionPlan = userData.subscriptionPlan || 'Free';


    // --------------------------------------------------------
    // 3. READ POST DATA
    // --------------------------------------------------------

    const {
      postType,
      title,
      description,
      abstract,
      articleText,
      tags,
      plan
    } = req.body;


    // --------------------------------------------------------
    // 4. VALIDATE POST TYPE
    // --------------------------------------------------------

    if (!postType) {
      return res.status(400).json({
        message: 'Post type is required.'
      });
    }

    if (!['question', 'article'].includes(postType)) {
      return res.status(400).json({
        message: 'Post type must be either question or article.'
      });
    }


    // --------------------------------------------------------
    // 5. VALIDATE TITLE
    // --------------------------------------------------------

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        message: 'A valid title is required.'
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        message: 'Title must contain at least 3 characters.'
      });
    }


    // --------------------------------------------------------
    // 6. VALIDATE QUESTION
    // --------------------------------------------------------

    if (postType === 'question') {

      if (
        !description ||
        typeof description !== 'string' ||
        !description.trim()
      ) {
        return res.status(400).json({
          message: 'Question description is required.'
        });
      }

    }


    // --------------------------------------------------------
    // 7. VALIDATE ARTICLE
    // --------------------------------------------------------

    if (postType === 'article') {

      if (
        !abstract ||
        typeof abstract !== 'string' ||
        !abstract.trim()
      ) {
        return res.status(400).json({
          message: 'Article abstract is required.'
        });
      }

      if (
        !articleText ||
        typeof articleText !== 'string' ||
        !articleText.trim()
      ) {
        return res.status(400).json({
          message: 'Article text is required.'
        });
      }

    }


    // --------------------------------------------------------
    // 8. VALIDATE TAGS
    // --------------------------------------------------------

    if (!tags || typeof tags !== 'string' || !tags.trim()) {
      return res.status(400).json({
        message: 'At least one tag is required.'
      });
    }

    // Convert comma-separated tags into an array
    const tagsArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Maximum of 3 tags
    if (tagsArray.length > 3) {
      return res.status(400).json({
        message: 'You can only add up to 3 tags.'
      });
    }


    // --------------------------------------------------------
    // 9. VALIDATE POST PLAN
    // --------------------------------------------------------

    const postPlan = plan || 'Free';

    if (!['Free', 'Paid'].includes(postPlan)) {
      return res.status(400).json({
        message: 'Post plan must be either Free or Paid.'
      });
    }


    // --------------------------------------------------------
    // 10. PREVENT FREE USERS CREATING PAID POSTS
    // --------------------------------------------------------

    if (
      postPlan === 'Paid' &&
      subscriptionPlan !== 'Paid'
    ) {
      return res.status(403).json({
        message: 'You must have a Paid subscription to create a Paid post.'
      });
    }


    // --------------------------------------------------------
    // 11. CREATE FIRESTORE DOCUMENT
    // --------------------------------------------------------

    const postData = {

      // Store the post type
      postType: postType,

      // Store title
      title: title.trim(),

      // Store question description
      description:
        postType === 'question'
          ? description.trim()
          : '',

      // Store article abstract
      abstract:
        postType === 'article'
          ? abstract.trim()
          : '',

      // Store article text
      articleText:
        postType === 'article'
          ? articleText.trim()
          : '',

      // Store tags as an array
      tags: tagsArray,

      // Store whether post is Free or Paid
      plan: postPlan,

      // Store Firebase user's ID
      userId: userId,

      // Store user's subscription plan
      authorPlan: subscriptionPlan,

      // Store creation timestamp
      createdAt: new Date()
    };


    // Save the post into Firestore
    const postReference = await db
      .collection('posts')
      .add(postData);


    // --------------------------------------------------------
    // 12. SUCCESS RESPONSE
    // --------------------------------------------------------

    console.log(
      'Post created successfully:',
      postReference.id
    );

    return res.status(201).json({

      message: 'Post created successfully.',

      postId: postReference.id

    });


  } catch (error) {

    // --------------------------------------------------------
    // AUTHENTICATION ERROR
    // --------------------------------------------------------

    if (
      error.code === 'auth/id-token-expired' ||
      error.code === 'auth/argument-error' ||
      error.code === 'auth/invalid-id-token'
    ) {

      return res.status(401).json({
        message: 'Your login session is invalid or expired. Please log in again.'
      });

    }


    // --------------------------------------------------------
    // GENERAL ERROR
    // --------------------------------------------------------

    console.error('Create post error:', error);

    return res.status(500).json({
      message: 'Something went wrong while creating the post.'
    });

  }

});


// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, '0.0.0.0', () => {

  console.log(
    `Server running on port ${PORT}`
  );

});