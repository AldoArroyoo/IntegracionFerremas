class Pedido {
    constructor(cod_pedido, cliente, fecha, total_pedido, estado) {
        this.cod_pedido = cod_pedido,
        this.fecha = fecha,
        this.total_pedido = total_pedido, 
        this.estado = estado,
        this.cliente = cliente
    }

    toJSON(){
        return {
            cod_pedido: this.cod_pedido,
            fecha: this.fecha,
            total_pedido: this.total_pedido,
            estado: this.estado,
            cliente: this.cliente
        }
    }
}

module.exports = Pedido;