class Tipo_producto {
    constructor(cod_tipo, nom_tipo, categoria) {
        this.cod_tipo = cod_tipo,
            this.nom_tipo = nom_tipo,
            this.categoria = categoria
    }


    to_json() {
        const json = {
            "cod_tipo": this.cod_tipo,
            "nom_tipo": this.nom_tipo,
            "categoria": this.categoria.to_json()
        }
        return json
    }
}

module.exports = Tipo_producto