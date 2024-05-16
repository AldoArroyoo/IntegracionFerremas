class DetallePedido {
    constructor(cantidad, precio, pedido, producto){
        this.cantidad = cantidad,
        this.pedido = precio,
        this.total_detalle = cantidad * precio,
        this.pedido = pedido,
        this.precio = precio,
        this.producto = producto
    }

    toJSON(){
        this.cantidad = cantidad,
        this.pedido = precio,
        this.total_detalle = total_detalle,
        this.pedido = pedido.toJSON(),
        this.precio = precio,
        this.producto = producto.toJSON()
    }

}


module.exports = DetallePedido;