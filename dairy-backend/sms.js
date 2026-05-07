const AfricasTalking = require('africastalking');
require('dotenv').config();

const at = AfricasTalking({
  username: process.env.AT_USERNAME,
  apiKey: process.env.AT_API_KEY,
});

const sms = at.SMS;

const sendSMS = async (phone, message) => {
  try {
    const result = await sms.send({
      to: [phone],
      message: message,
      from: '15629',
    });
    console.log('SMS sent:', result);
    return result;
  } catch (err) {
    console.error('SMS error:', err.message);
    // Don't throw — notifications still work even if SMS fails
  }
};

module.exports = sendSMS;