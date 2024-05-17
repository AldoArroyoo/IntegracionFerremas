class DetallePedido {
    constructor(cantidad, precio, pedido, producto) {
        this.cantidad = cantidad;
        this.precio = precio;
        this.total_detalle = cantidad * precio;
        this.pedido = pedido;
        this.producto = producto;
    }

    toJSON() {
        return {
            cantidad: this.cantidad,
            precio: this.precio,
            total_detalle: this.total_detalle,
            pedido: this.pedido.toJSON(),
            producto: this.producto.toJSON()
        };
    }
}



module.exports = DetallePedido;