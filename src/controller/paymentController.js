const { HOST, PAYPAL_API, PAYPAL_API_CLIENT, PAYPAL_API_SECRET } = require("../config.js");
const axios = require('axios');

const createOrder = async (req, res) => { 
    // Validar que las variables de entorno estén definidas
    if (!HOST || !PAYPAL_API || !PAYPAL_API_CLIENT || !PAYPAL_API_SECRET) {
        return res.status(500).json({ error: 'Configuration error' });
    }

    // Validar datos de entrada
    // const { amount } = req.body;
    // if (!amount || isNaN(amount)) {
    //     return res.status(400).json({ error: 'Invalid amount' });
    // }

    const order = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: 100.00
                }
            }
        ],
        application_context: {
            brand_name: "Ferremas",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            return_url: `${HOST}/1.0/pagos/capture-order`,
            cancel_url: `${HOST}/1.0/pagos/cancel-order`
        }
    };

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');

        const { data: { access_token } } = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, params, {
            auth: {
                username: PAYPAL_API_CLIENT,
                password: PAYPAL_API_SECRET
            }
        });

        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, order, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(response.data);
        //return res.json(response.data);
        return res.redirect(response.data.links[1].href);

    } catch (error) {
        console.error('Error creating order:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: 'Error creating order' });
    }
};

const captureOrder = async (req, res) => {
    const { token } = req.query;

    // Validar que el token esté presente
    if (!token) {
        return res.status(400).json({ error: 'Missing token' });
    }

    try {
        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {}, {
            auth: {
                username: PAYPAL_API_CLIENT,
                password: PAYPAL_API_SECRET
            }
        });

        console.log(response.data);
        return res.send('Payment successful');
        //Aqui deberia enviar una respusta para que la api pedidos actualice el estado del pedido

    } catch (error) {
        console.error('Error capturing order:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: 'Error capturing order' });
    }
};

const cancelOrder = (req, res) => {
    return res.send('Payment canceled');
};

module.exports = { createOrder, captureOrder, cancelOrder };
