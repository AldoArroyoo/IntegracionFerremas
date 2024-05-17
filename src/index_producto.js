const express = require("express")

const app = express()
app.use(express.json())
app.get("/",(request, response)=>{
    response.send("<p>api producto funcionando correctamente</p>")
})
app.use("/1.0/productos/", require("./router/productoRouter"))
const port = 3002
app.listen(port,()=>{console.log("api corriendo en el puerto 3002")})