const express = require("express")

const app = express()
app.use(express.json())
app.get("/",(request, response)=>{
    response.send("<p>api pagos funcionando correctamente</p>")
})
app.use("/1.0/pagos/", require("./router/paymentRouter"))
const port = 3004
app.listen(port,()=>{console.log("api corriendo en el puerto: ", port)});