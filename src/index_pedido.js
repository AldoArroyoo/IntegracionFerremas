const express = require("express")

const app = express()
app.use(express.json())
app.get("/",(request, response)=>{
    response.send("<p>api pedido funcionando correctamente</p>")
})
app.use("/1.0/pedidos/", require("./router/pedidoRouter"))
const port = 3003
app.listen(port,()=>{console.log("api corriendo en el puerto 3003")})