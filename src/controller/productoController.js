const { abrirConexion, ErrorDBA } = require("../database.js")
const Producto = require("../models/Producto.js")
const Categoria = require("../models/Categoria.js")
const Tipo_producto = require("../models/Tipo_producto.js")
const Marca = require("../models/Marca.js")
const Modelo = require("../models/Modelo.js")
const Estado = require("../models/Estado.js")
const { query } = require("express")
const axios = require("axios")

class ErrorTraerPorCategoria extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorTraerPorCategoria";
    }
}

class ErrorTraerPorEstado extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorTraerPorEstado";
    }
}

class ErrorTraerPorMarca extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorTraerPorMarca";
    }
}

class ErrorTraerEspecifico extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorTraerEspecifico";
    }
}

class ErrorModificarEstado extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorModificarEstado";
    }
}

Producto.traerPorCategoria = async (request, response) => {
    const cod_categoria = request.params.cod
    const productos = []
    var connection = null

    try {
        connection = await abrirConexion()
console.log("abri la coneccion")
        var Query = `SELECT p.cod_producto, 
                            p.nom_producto, 
                            p.precio, 
                            p.codigo, 
                            p.descuento, 
                            p.cod_tipo,
                            tp.nom_tipo,
                            p.cod_modelo,
                            m.nom_modelo, 
                            p.cod_estado,
                            ma.cod_marca,
                            ma.nom_marca,
                            e.nom_estado,
                            c.nom_categoria
                    FROM MARCA AS ma 
                    JOIN MODELO AS m ON (ma.cod_marca = m.cod_marca)
                    JOIN PRODUCTO AS p ON (m.cod_modelo = p.cod_modelo)
                    JOIN ESTADO AS e ON (p.cod_estado = e.cod_estado)
                    JOIN TIPO_PRODUCTO AS tp ON (p.cod_tipo = tp.cod_tipo)
                    JOIN CATEGORIA AS c ON (p.cod_categoria = c.cod_categoria)
                    WHERE c.cod_categoria = ?`
console.log("pase por aqui")

console.log(await obtenerCambio())
        const values = [cod_categoria]
        
        const [filas, otro] = await connection.query(Query, values)
        console.log("pase el query")
        if (filas.length === 0) {
            throw new ErrorTraerPorCategoria('No hay productos en esta categoría')
        }

        filas.map(f => {
            var categoria = new Categoria (cod_categoria, f.nom_categoria)
            var tipo = new Tipo_producto (f.cod_tipo, f.nom_tipo)
            var marca = new Marca (f.cod_marca, f.nom_marca)
            var modelo = new Modelo (f.cod_modelo, f.nom_modelo, marca)
            var estado = new Estado (f.cod_estado, f.nom_estado)
            var producto = new Producto (f.cod_producto, f.nom_producto, f.codigo, f.precio,
                                        f.descuento, tipo, modelo, estado, categoria)
console.log("ya pase")


                productos.push(producto.to_json())
                console.log("ya pase")
    })

        return response.status(202).json(productos)
    } catch (error) {
console.log(error)
        if (error instanceof ErrorDBA) {
            return response.status(500).json(error.message)

        }else if (error instanceof ErrorTraerPorCategoria) {
            return response.status(500).json(error.message)

        } else {
            return response.status(500).json(error)
        }
    }
    finally {
        if (connection) {
            connection.release()
        }
    }
};


Producto.traerPorEstado = async (request, response) => {
    const cod_estado = request.params.cod
    const productos = []
    var connection = null

    try {
        connection = await abrirConexion()

        var Query = `SELECT p.cod_producto, 
                            p.nom_producto, 
                            p.precio, 
                            p.codigo, 
                            p.descuento, 
                            p.cod_tipo,
                            tp.nom_tipo,
                            p.cod_modelo,
                            m.nom_modelo, 
                            p.cod_estado,
                            ma.cod_marca,
                            ma.nom_marca,
                            e.nom_estado,
                            c.nom_categoria,
                            c.cod_categoria
                    FROM MARCA AS ma 
                    JOIN MODELO AS m ON (ma.cod_marca = m.cod_marca)
                    JOIN PRODUCTO AS p ON (m.cod_modelo = p.cod_modelo)
                    JOIN ESTADO AS e ON (p.cod_estado = e.cod_estado)
                    JOIN TIPO_PRODUCTO AS tp ON (p.cod_tipo = tp.cod_tipo)
                    JOIN CATEGORIA AS c ON (p.cod_categoria = c.cod_categoria)
                    WHERE p.cod_estado = ?`

                    const values = [cod_estado]

                    console.log(values)
        
        const [filas, otro] = await connection.query(Query, values)
        console.log(filas)
        if (filas.length === 0) {
            throw new ErrorTraerPorEstado("No hay productos con este estado")
        }

        filas.map(f => {
            var categoria = new Categoria (f.cod_categoria, f.nom_categoria)
            var tipo = new Tipo_producto (f.cod_tipo, f.nom_tipo)
            var marca = new Marca (f.cod_marca, f.nom_marca)
            var modelo = new Modelo (f.cod_modelo, f.nom_modelo, marca)
            var estado = new Estado (cod_estado, f.nom_estado)
            var producto = new Producto (f.cod_producto, f.nom_producto, f.codigo, f.precio,
                                        f.descuento, tipo, modelo, estado, categoria)

                productos.push(producto.to_json())

    })

        return response.status(202).json(productos)


    } catch (error) {
console.log(error)
        if (error instanceof ErrorDBA) {
            return response.status(500).json(error.message)

        }else if (error instanceof ErrorTraerPorEstado) {
            return response.status(500).json(error.message)

        } else {
            return response.status(500).json(error)
        }
    }
    finally {
        if (connection) {
            connection.release()
        }
    }
};



Producto.traerPorMarca = async (request, response) => {
    const cod_marca = request.params.cod
    const productos = []
    var connection = null

    try {
        connection = await abrirConexion()

        var Query = `SELECT p.cod_producto, 
                            p.nom_producto, 
                            p.precio, 
                            p.codigo, 
                            p.descuento, 
                            p.cod_tipo,
                            tp.nom_tipo,
                            p.cod_modelo,
                            m.nom_modelo, 
                            p.cod_estado,
                            ma.cod_marca,
                            ma.nom_marca,
                            e.nom_estado,
                            c.nom_categoria,
                            c.cod_categoria
                    FROM MARCA AS ma 
                    JOIN MODELO AS m ON (ma.cod_marca = m.cod_marca)
                    JOIN PRODUCTO AS p ON (m.cod_modelo = p.cod_modelo)
                    JOIN ESTADO AS e ON (p.cod_estado = e.cod_estado)
                    JOIN TIPO_PRODUCTO AS tp ON (p.cod_tipo = tp.cod_tipo)
                    JOIN CATEGORIA AS c ON (p.cod_categoria = c.cod_categoria)
                    WHERE ma.cod_marca = ?`

                    const values = [cod_marca]
        
        const [filas, otro] = await connection.query(Query, values)
        console.log(values)
        if (filas.length === 0) {
            throw new ErrorTraerPorMarca("No hay productos con esta marca")
        }

        filas.map(f => {
            var categoria = new Categoria (f.cod_categoria, f.nom_categoria)
            var tipo = new Tipo_producto (f.cod_tipo, f.nom_tipo)
            var marca = new Marca (cod_marca, f.nom_marca)
            var modelo = new Modelo (f.cod_modelo, f.nom_modelo, marca)
            var estado = new Estado (f.cod_estado, f.cod_estado)
            var producto = new Producto (f.cod_producto, f.nom_producto, f.codigo, f.precio,
                                        f.descuento, tipo, modelo, estado, categoria)

                productos.push(producto.to_json())

    })

        return response.status(202).json(productos)


    } catch (error) {

        if (error instanceof ErrorDBA) {
            return response.status(500).json(error.message)

        }else if (error instanceof ErrorTraerPorMarca) {
            return response.status(500).json(error.message)

        } else {
            return response.status(500).json(error)
        }
    }
    finally {
        if (connection) {
            connection.release()
        }
    }
};



Producto.traerEspecifico = async (request, response) => {
    const cod_producto = request.params.cod
    const productos = []
    var connection = null

    try {
        connection = await abrirConexion()

        var Query = `SELECT p.cod_producto, 
                            p.nom_producto, 
                            p.precio, 
                            p.codigo, 
                            p.descuento, 
                            p.cod_tipo,
                            tp.nom_tipo,
                            p.cod_modelo,
                            m.nom_modelo, 
                            p.cod_estado,
                            ma.cod_marca,
                            ma.nom_marca,
                            e.nom_estado,
                            c.nom_categoria,
                            c.cod_categoria
                    FROM MARCA AS ma 
                    JOIN MODELO AS m ON (ma.cod_marca = m.cod_marca)
                    JOIN PRODUCTO AS p ON (m.cod_modelo = p.cod_modelo)
                    JOIN ESTADO AS e ON (p.cod_estado = e.cod_estado)
                    JOIN TIPO_PRODUCTO AS tp ON (p.cod_tipo = tp.cod_tipo)
                    JOIN CATEGORIA AS c ON (p.cod_categoria = c.cod_categoria)
                    WHERE c.cod_categoria = ?`

                    const values = [cod_producto]
        
        const [filas, otro] = await connection.query(Query, values)
        console.log(values)
        if (filas.length === 0) {
            throw new ErrorTraerEspecifico("No se encontro el producto")
        }

        filas.map(f => {
            var categoria = new Categoria (f.cod_categoria, f.nom_categoria)
            var tipo = new Tipo_producto (f.cod_tipo, f.nom_tipo, categoria)
            var marca = new Marca (f.cod_marca, f.nom_marca)
            var modelo = new Modelo (f.cod_modelo, f.nom_modelo, marca)
            var estado = new Estado (f.cod_estado, f.cod_estado)
            var producto = new Producto (cod_producto, f.nom_producto, f.codigo, f.precio,
                                        f.descuento, tipo, modelo, categoria, estado)

                productos.push(producto.to_json())

    })

        return response.status(202).json(productos)


    } catch (error) {
console.log(error)
        if (error instanceof ErrorDBA) {
            return response.status(500).json(error.message)

        }else if (error instanceof ErrorTraerEspecifico) {
            return response.status(500).json(error.message)

        } else {
            return response.status(500).json(error)
        }
    }
    finally {
        if (connection) {
            connection.release()
        }
    }
};


Producto.modificarEstado = async (request, response) => {
    const cod_producto = request.params.cod
    const { nuevo_estado, nuevo_descuento, nueva_categoria } = request.body
    var connection = null

    try {
        connection = await abrirConexion()
        
        // Obtener el precio actual del producto y su categoria
        const precioQuery = `SELECT precio, cod_estado, descuento FROM PRODUCTO WHERE cod_producto = ?`
        const values = [cod_producto]
        const [filas, otros] = await connection.query(precioQuery, values)
        const precioActual = filas[0].precio
        const estadoAnterior = filas[0].cod_estado
        const descuentoActual = filas[0].descuento
        const porcentajeFaltante = 100 - descuentoActual
        
        console.log(precioActual)

        if (nuevo_estado === 1 || nuevo_estado === 3) {
            const estadoAnteriorQuery = `SELECT precio FROM PRODUCTO WHERE cod_producto = ?`
            const values2 = [cod_producto]
            const [filas1, otros] = await connection.query(estadoAnteriorQuery, values2)
            const precioAnterior = filas1[0].precio
            nuevoPrecio = precioAnterior * nuevo_descuento / 100
            if (estadoAnterior === 1){
                nuevoPrecio = (precioActual * 100 / porcentajeFaltante) * (nuevo_descuento/100)
            }else if (estadoAnterior === 3){
                nuevoPrecio = (precioAnterior * 100 / porcentajeFaltante) * (nuevo_descuento/100)
            }else if (estadoAnterior === 2){
                nuevoPrecio = precioActual * ((100 - nuevo_descuento)/100)
            }

        }else if (nuevo_estado === 2){
            const estadoAnteriorQuery = `SELECT precio FROM PRODUCTO WHERE cod_producto = ?`
            const values3 = [cod_producto]
            const [filas2, otros] = await connection.query(estadoAnteriorQuery, values3)
            const precioAnterior = filas2[0].precio
            nuevoPrecio = precioAnterior * 100 / porcentajeFaltante
        }

        // Actualizar el estado y el precio del producto
        const updateQuery = `UPDATE PRODUCTO SET cod_estado = ?, precio = ?, descuento = ?, cod_categoria = ? WHERE cod_producto = ?`;
        const [resultado] = await connection.query(updateQuery, [nuevo_estado, nuevoPrecio, nuevo_descuento, nueva_categoria, cod_producto]);

        if (resultado.affectedRows === 0) {
            throw new ErrorModificarEstado("No se encontrÃ³ el producto o no se pudo actualizar el estado");
        }

        return response.status(202).json("Estado del producto actualizado correctamente" );
    } catch (error) {
        console.log(error)
        if (error instanceof ErrorDBA) {
            return response.status(500).json(error.message)

        } else if (error instanceof ErrorModificarEstado) {
            return response.status(500).json(error.message)

        } else {
            return response.status(500).json(error)
        }
    } finally {
        if (connection) {
            connection.release()
        }
    }
};

async function obtenerCambio () {
    try{

        console.log(process.env.PASSWORD_BANCO_CENTRAL)

        const fecha = new Date()
        var dia = String(fecha.getDate()).padStart(2,"0")
        var mes = String(fecha.getMonth()+1).padStart(2,"0")
        var anio = fecha.getFullYear()
        var URL = `https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?user=${process.env.USER_BANCO_CENTRAL}&pass=${process.env.PASSWORD_BANCO_CENTRAL}&firstdate=${anio}-${mes}-${dia}&timeseries=F073.TCO.PRE.Z.D&function=GetSeries`
        console.log(URL)
        const valorDolar= await axios.get(URL)

        return valorDolar.data.Series.Obs[0].value

    }catch (error) {
        return error
    }
}

module.exports = Producto



