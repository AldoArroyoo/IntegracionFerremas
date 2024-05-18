const { HOST, PAYPAL_API, PAYPAL_API_CLIENT, PAYPAL_API_SECRET } = require("../config.js");
console.log(HOST, PAYPAL_API, PAYPAL_API_CLIENT, PAYPAL_API_SECRET)
const axios = require('axios');

const createOrder = async (req, res) => { 
    const order = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: "100.00"
                },
                amount: {
                    currency_code: "USD",
                    value: "50.00"
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
    }
    
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    // console.log("PRUEBA : ", PAYPAL_API);
    // console.log("PRUEBA : ", PAYPAL_API_CLIENT);
    // console.log("PRUEBA : ", PAYPAL_API_SECRET);

    const { data: {access_token} } = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, params, {
        auth:{
        username: PAYPAL_API_CLIENT,
        password: PAYPAL_API_SECRET
        }
    });
    

    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, order, 
    {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    console.log(response.data)
    
    return res.json(response.data);
};

//Cuando el usuario el apgo este debe guardarse por lo que el capture order lo realiza
const captureOrder = async (req, res) => {
    const { token } = req.query

    console.log(PAYPAL_API)
    console.log("EL TOKKEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEN")
    console.log(token)
    

    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
    {}, {
            auth:{
            username: PAYPAL_API_CLIENT,
            password: PAYPAL_API_SECRET
            }
        });

    console.log(response.data);

    return res.send('payed')
};

const cancelOrder =  (req, res) => res.send('Cancel Payment');



module.exports = { createOrder, captureOrder, cancelOrder};