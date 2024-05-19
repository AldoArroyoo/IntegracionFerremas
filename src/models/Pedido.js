class Pedido {
    constructor(cod_pedido, cliente, fecha, total_pedido, estado, sucursal) {
        this.cod_pedido = cod_pedido,
        this.fecha = fecha,
        this.total_pedido = total_pedido, 
        this.estado = estado,
        this.cliente = cliente,
        this.sucursal = sucursal,
        this.detalles = [];
    }

    agregarDetalle(detalle) {
        this.detalles.push(detalle);
    }

    toJSON(){
        return {
            cod_pedido: this.cod_pedido,
            fecha: this.fecha,
            total_pedido: this.total_pedido,
            estado: this.estado,
            cliente: this.cliente,
            detalles: this.detalles
        }
    }
}

module.exports = Pedido;