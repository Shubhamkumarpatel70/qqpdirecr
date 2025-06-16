import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { textEmailTemplate, htmlEmailTemplate } from './emailTemplates.js';  // Add .js extension

dotenv.config(); // ✅ Make sure environment variables are loaded

const OTP_CONFIG = {
  EXPIRATION_MINUTES: 10,
};

// Create email transporter with error handling
const createEmailTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email configuration error:', error);
      } else {
        console.log('✅ Email server is ready to send messages');
      }
    });

    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    throw new Error('Email service configuration failed');
  }
};

const emailTransporter = createEmailTransporter();

/**
 * Generate and send OTP to user's email
 */
export const generateAndSendOtp = async (email, user) => {
  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Set OTP and expiration time for the user
    user.otp = hashedOtp;
    user.otpExpires = Date.now() + OTP_CONFIG.EXPIRATION_MINUTES * 60 * 1000;
    user.otpAttempts = 0;
    
    // Save user with OTP
    try {
      await user.save();
    } catch (saveError) {
      console.error('❌ Failed to save OTP:', saveError);
      throw new Error('Failed to save OTP');
    }

    const expirationMinutes = OTP_CONFIG.EXPIRATION_MINUTES;

    // Prepare email content
    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME || 'Auth System'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: textEmailTemplate(user.name, otp, expirationMinutes),
      html: htmlEmailTemplate(user.name, otp, expirationMinutes),
    };

    // Send email
    try {
      const info = await emailTransporter.sendMail(mailOptions);
      console.log('✅ OTP email sent:', {
        messageId: info.messageId,
        to: email,
        timestamp: new Date().toISOString()
      });
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', {
        error: emailError,
        to: email,
        timestamp: new Date().toISOString()
      });
      
      // Revert OTP changes if email fails
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = undefined;
      await user.save();
      
      throw new Error('Failed to send OTP email');
    }
  } catch (error) {
    console.error('❌ OTP generation/sending failed:', {
      error: error.message,
      email,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};
