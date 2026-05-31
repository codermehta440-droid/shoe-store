const sgMail = require('@sendgrid/mail');

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is required in .env for email delivery');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (message) => {
  const msg = {
    from: process.env.EMAIL_USER || process.env.SENDGRID_FROM,
    ...message
  };

  if (!msg.from) {
    throw new Error('Email sender address is required via EMAIL_USER or SENDGRID_FROM');
  }

  return sgMail.send(msg);
};

module.exports = {
  sendMail
};