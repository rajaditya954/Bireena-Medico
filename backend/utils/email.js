import nodemailer from "nodemailer";
import { config } from "../config/env.js";

let transporter = null;

if (config.emailUser && config.emailPass) {
  transporter = nodemailer.createTransport({
    service: config.emailService || "gmail",
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });
}

export const sendEmail = async (to, subject, html) => {
  try {
    if (!transporter) {
      console.warn("Email service not configured");
      return false;
    }

    const mailOptions = {
      from: config.emailUser,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

export const sendAppointmentConfirmation = async (patientEmail, appointmentDetails) => {
  const html = `
    <h2>Appointment Confirmation</h2>
    <p>Your appointment has been confirmed.</p>
    <p><strong>Date:</strong> ${appointmentDetails.date}</p>
    <p><strong>Time:</strong> ${appointmentDetails.time}</p>
    <p><strong>Doctor:</strong> ${appointmentDetails.doctorName}</p>
  `;
  return sendEmail(patientEmail, "Appointment Confirmation", html);
};

export const sendPaymentReceipt = async (patientEmail, paymentDetails) => {
  const html = `
    <h2>Payment Receipt</h2>
    <p>Thank you for your payment.</p>
    <p><strong>Amount:</strong> ${paymentDetails.amount}</p>
    <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
  `;
  return sendEmail(patientEmail, "Payment Receipt", html);
};
