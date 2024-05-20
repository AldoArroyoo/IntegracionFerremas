const express = require("express")

const app = express()
app.use(express.json())
app.get("/",(request, response)=>{
    response.send("<p>api pedido funcionando correctamente</p>")
})
app.use("/1.0/consultas/", require("./router/consultaRouter.js"))
const port = 3005
app.listen(port,()=>{console.log("api corriendo en el puerto 3005")})