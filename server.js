const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {generateJwtToken , sendVerificationEmail } = require("./utils/email-sender")

require('dotenv').config({path:"./.secrets/.env"}); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- JWT and Email logic ---
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const BASE_URL = process.env.BASE_URL;


// --- Express routes ---

// Endpoint to trigger the email sending process
app.post('/register', (req, res) => {
  const { email } = req.body;

  // In a real application, you would save the user to a database first
  // and get a unique user ID.
  const userId = crypto.randomUUID();
  const userPayload = { email: email, userId: userId };

  const token = generateJwtToken(userPayload);
  sendVerificationEmail(email, token);

  res.status(200).json({
    message: 'Verification email sent. Please check your inbox.',
  });
});

// Endpoint for the user to verify their email
app.get('/verify', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Invalid verification link.');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Here, you would update the user's status in your database
    // to mark their email as verified.
    console.log('User verified:', decoded.email);
    res.send('<h1>Email Verified Successfully!</h1><p>You can now log in.</p>');
  } catch (err) {
    res.status(400).send('Verification link is invalid or has expired.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
