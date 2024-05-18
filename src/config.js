const { config } = require("dotenv");
config();

const PORT = 3004;

const HOST = 'HTTP:/localhost:' + PORT;

const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT;


const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;

const PAYPAL_API = 'https://api-m.sandbox.paypal.com'

module.exports = {
    PORT,
    HOST,
    PAYPAL_API_CLIENT,
    PAYPAL_API_SECRET,
    PAYPAL_API,
};