if(process.env.NODE !== 'production'){
  require('dotenv').config({path:"../.secrets/.env"}); // Load environment variables from .env
}

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// --- JWT and Email logic ---
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const BASE_URL = process.env.BASE_URL;


// Function to generate a JWT
const generateJwtToken = (userPayload) => {
  return jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
}

// Function to send the email
const sendVerificationEmail = async (recipientEmail, token) =>  {
  try {
  // console.log('sendVerificationEmail funtion run!')
  // console.log('EMAIL_USER: ',EMAIL_USER)

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS, // This should be your App Password
    },
  });

  const verificationLink = `${BASE_URL}/verify?token=${token}`;
  // console.log("Verification Link: " , verificationLink)

  const mailOptions = {
    from: EMAIL_USER,
    to: recipientEmail,
    subject: 'Email Verification',
    html: `
      <h2>Hello!</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
    
  } catch (error) {
    throw new Error(`Internal Server Error: ${error.message}`);
  }
}


module.exports = {generateJwtToken , sendVerificationEmail }

// sendVerificationEmail()
