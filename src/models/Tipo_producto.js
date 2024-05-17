class Tipo_producto {
    constructor(cod_tipo, nom_tipo) {
        this.cod_tipo = cod_tipo,
            this.nom_tipo = nom_tipo
    }


    to_json() {
        const json = {
            "cod_tipo": this.cod_tipo,
            "nom_tipo": this.nom_tipo,
        }
        return json
    }
}

module.exports = Tipo_producto