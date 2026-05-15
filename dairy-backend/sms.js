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
    });
console.log('SMS sent:', JSON.stringify(result, null, 2));    return result;
  } catch (err) {
    console.error('SMS error:', err.message);
  }
};

module.exports = sendSMS;