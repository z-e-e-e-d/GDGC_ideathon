// utils/sendEmail.js
require("dotenv").config();
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    console.log("email_host", process.env.EMAIL_HOST);
    console.log("email_port", process.env.EMAIL_PORT);
    console.log("email_user", process.env.EMAIL_USER);
    console.log("email_pass", process.env.EMAIL_PASS);
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
      port: process.env.EMAIL_PORT, // e.g., 587
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your email password or app password
      },
    });

    // Send mail
    await transporter.sendMail({
      from: `"OPOW" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
