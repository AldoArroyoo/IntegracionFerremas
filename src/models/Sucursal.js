class Sucursal {
    constructor(cod_sucursal, direccion, correo) {
        this.cod_sucursal = cod_sucursal,
            this.direccion = direccion,
            this.correo = correo
    }


    to_json() {
        const json = {
            "cod_sucursal": this.cod_sucursal,
            "direccion": this.direccion,
            "correo": this.correo
        }
        return json
    }
}

module.exports = Sucursal