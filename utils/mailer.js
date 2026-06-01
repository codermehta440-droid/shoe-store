let sendMail;

// Prefer SendGrid if API key is configured
if (process.env.SENDGRID_API_KEY) {
  try {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    sendMail = async (message) => {
      const msg = {
        from: process.env.EMAIL_USER || process.env.SENDGRID_FROM,
        ...message
      };

      if (!msg.from) {
        console.warn('Mailer: no sender configured (EMAIL_USER or SENDGRID_FROM)');
        // don't throw — fail silently to avoid blocking app
        return Promise.resolve();
      }

      // return the promise but callers should avoid awaiting when possible
      return sgMail.send(msg);
    };
  } catch (err) {
    console.error('Mailer: failed to initialize SendGrid client:', err);
  }
}

// Fallback to SMTP via nodemailer when SendGrid isn't available
if (!sendMail && process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    const nodemailer = require('nodemailer');

    const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 465;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // timeouts to prevent long hangs
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });

    sendMail = async (message) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        ...message
      };

      try {
        return transporter.sendMail(mailOptions);
      } catch (err) {
        console.error('Mailer(SMTP) error:', err && err.message ? err.message : err);
        // swallow error to avoid blocking; return resolved promise so callers don't hang
        return Promise.resolve();
      }
    };
  } catch (err) {
    console.error('Mailer: failed to initialize nodemailer fallback:', err);
  }
}

// Final fallback: no-op sendMail that resolves immediately
if (!sendMail) {
  sendMail = async (message) => {
    console.warn('Mailer: no provider configured, skipping send.');
    return Promise.resolve();
  };
}

module.exports = {
  sendMail
};