// email.js
// Utility for sending emails using EmailJS (client-side)
// https://www.emailjs.com/

import emailjs from 'emailjs-com';

export function sendBillEmail({ to, subject, message, fromEmail }) {
  // These values should be set in your EmailJS dashboard
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

  // Send as plain text (no attachments)
  const templateParams = {
    to_email: to,
    from_email: fromEmail,
    subject,
    message, // This will be inserted as the email body
  };

  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
}
