const express = require("express")

const app = express()
app.use(express.json())
app.get("/",(request, response)=>{
    response.send("<p>api login funcionando correctamente</p>")
})
app.use("/1.0/", require("./router/usuarioRouter"))
const port = 3001
app.listen(port,()=>{console.log("api corriendo en el puerto 3001")})