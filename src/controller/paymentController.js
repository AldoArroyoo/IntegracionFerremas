const { HOST, PAYPAL_API, PAYPAL_API_CLIENT, PAYPAL_API_SECRET } = require("../config.js");
const axios = require('axios');
const Pedido = require("../controller/pedidoController.js");

const createOrder = async (req, res) => { 
    const { cod_pedido, total_pedido } = req.body;
    if (!total_pedido || isNaN(total_pedido)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
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
                    value: total_pedido
                }
            }
        ],
        application_context: {
            brand_name: "Ferremas",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            return_url: `${HOST}/1.0/pagos/capture-order?cod_pedido=${cod_pedido}`, // Pasar el código del pedido como parámetro en la URL
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
    const { token, cod_pedido } = req.query; // Obtener el código del pedido de los parámetros de la solicitud

    // Validar que el token y el código del pedido estén presentes
    if (!token || !cod_pedido) {
        return res.status(400).json({ error: 'Missing token or cod_pedido' });
    }

    try {
        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {}, {
            auth: {
                username: PAYPAL_API_CLIENT,
                password: PAYPAL_API_SECRET
            }
        });

        // Actualizar el estado del pedido
        await Pedido.updateEstado({ body: { cod_pedido, estado: true } }, res);
        // Aquí deberías enviar una respuesta para que la API de pedidos actualice el estado del pedido

        console.log(response.data);
        return res.send('Payment successful');

    } catch (error) {
        console.error('Error capturing order:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: 'Error capturing order' });
    }
};

const cancelOrder = (req, res) => {
    //Reestablecer stock
    return res.send('Payment canceled');
};


module.exports = { createOrder, captureOrder, cancelOrder };
