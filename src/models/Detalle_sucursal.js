class Detalle_sucursal {
    constructor(producto, sucursal, cantidad) {
        this.producto = producto,
            this.sucursal = sucursal,
            this.cantidad = cantidad
    }


    to_json() {
        const json = {
            "producto": this.producto.to_json(),
            "sucursal": this.sucursal.to_json(),
            "cantidad": this.cantidad
        }
        return json
    }
}

module.exports = Detalle_sucursal