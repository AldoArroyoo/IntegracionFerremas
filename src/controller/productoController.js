const { abrirConexion, ErrorDBA } = require("../database.js")
const Producto = require("../models/Producto.js")
const Categoria = require("../models/Categoria.js")
const Tipo_producto = require("../models/Tipo_producto.js")
const Marca = require("../models/Marca.js")
const Modelo = require("../models/Modelo.js")
const Estado = require("../models/Estado.js")

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

Producto.traerPorCategoria = async (request, response) => {
    const cod_categoria = request.params.cod
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
                            c.nom_categoria
                    FROM CATEGORIA AS c 
                    JOIN TIPO_PRODUCTO AS tp ON (c.cod_categoria = tp.cod_categoria)
                    JOIN PRODUCTO AS p ON (tp.cod_tipo = p.cod_tipo) 
                    JOIN ESTADO AS e ON (p.cod_estado = e.cod_estado)
                    JOIN MODELO AS m ON (p.cod_modelo = m.cod_modelo)
                    JOIN MARCA AS ma ON (m.cod_marca = ma.cod_marca)
                    WHERE c.cod_categoria = ?`

        const values = [cod_categoria]
        
        const [filas, otro] = await connection.query(Query, values)
        console.log(values)
        if (filas.length === 0) {
            throw new ErrorTraerPorCategoria('No hay productos en esta categoría')
        }

        filas.map(f => {
            var categoria = new Categoria (cod_categoria, f.nom_categoria)
            var tipo = new Tipo_producto (f.cod_tipo, f.nom_tipo, categoria)
            var marca = new Marca (f.cod_marca, f.nom_marca)
            var modelo = new Modelo (f.cod_modelo, f.nom_modelo, marca)
            var estado = new Estado (f.cod_estado, f.nom_estado)
            var producto = new Producto (f.cod_producto, f.nom_producto, f.codigo, f.precio,
                                        f.descuento, tipo, modelo, estado)
console.log("ya pase")
                productos.push(producto.to_json())
                console.log("ya pase")
    })

        return response.status(202).json(productos)
    } catch (error) {

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
                    FROM CATEGORIA AS c 
                    JOIN TIPO_PRODUCTO AS tp ON (c.cod_categoria = tp.cod_categoria)
                    JOIN PRODUCTO AS p ON (tp.cod_tipo = p.cod_tipo) 
                    JOIN ESTADO AS e ON (p.cod_estado = e.cod_estado)
                    JOIN MODELO AS m ON (p.cod_modelo = m.cod_modelo)
                    JOIN MARCA AS ma ON (m.cod_marca = ma.cod_marca)
                    WHERE p.cod_estado = ?`

                    const values = [cod_estado]
        
        const [filas, otro] = await connection.query(Query, values)
        console.log(values)
        if (filas.length === 0) {
            throw new ErrorTraerPorEstado("No hay productos con este estado")
        }

        filas.map(f => {
            var categoria = new Categoria (f.cod_categoria, f.nom_categoria)
            var tipo = new Tipo_producto (f.cod_tipo, f.nom_tipo, categoria)
            var marca = new Marca (f.cod_marca, f.nom_marca)
            var modelo = new Modelo (f.cod_modelo, f.nom_modelo, marca)
            var estado = new Estado (cod_estado, f.nom_estado)
            var producto = new Producto (f.cod_producto, f.nom_producto, f.codigo, f.precio,
                                        f.descuento, tipo, modelo, estado)

                productos.push(producto.to_json())

    })

        return response.status(202).json(productos)


    } catch (error) {

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
                    FROM CATEGORIA AS c 
                    JOIN TIPO_PRODUCTO AS tp ON (c.cod_categoria = tp.cod_categoria)
                    JOIN PRODUCTO AS p ON (tp.cod_tipo = p.cod_tipo) 
                    JOIN ESTADO AS e ON (p.cod_estado = e.cod_estado)
                    JOIN MODELO AS m ON (p.cod_modelo = m.cod_modelo)
                    JOIN MARCA AS ma ON (m.cod_marca = ma.cod_marca)
                    WHERE ma.cod_marca = ?`

                    const values = [cod_marca]
        
        const [filas, otro] = await connection.query(Query, values)
        console.log(values)
        if (filas.length === 0) {
            throw new ErrorTraerPorMarca("No hay productos con esta marca")
        }

        filas.map(f => {
            var categoria = new Categoria (f.cod_categoria, f.nom_categoria)
            var tipo = new Tipo_producto (f.cod_tipo, f.nom_tipo, categoria)
            var marca = new Marca (cod_marca, f.nom_marca)
            var modelo = new Modelo (f.cod_modelo, f.nom_modelo, marca)
            var estado = new Estado (f.cod_estado, f.cod_estado)
            var producto = new Producto (f.cod_producto, f.nom_producto, f.codigo, f.precio,
                                        f.descuento, tipo, modelo, categoria, estado)

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
                    FROM CATEGORIA AS c 
                    JOIN TIPO_PRODUCTO AS tp ON (c.cod_categoria = tp.cod_categoria)
                    JOIN PRODUCTO AS p ON (tp.cod_tipo = p.cod_tipo) 
                    JOIN ESTADO AS e ON (p.cod_estado = e.cod_estado)
                    JOIN MODELO AS m ON (p.cod_modelo = m.cod_modelo)
                    JOIN MARCA AS ma ON (m.cod_marca = ma.cod_marca)
                    WHERE p.cod_producto = ?`

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






module.exports = Producto