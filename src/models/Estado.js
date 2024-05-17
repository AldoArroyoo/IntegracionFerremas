class Estado {
    constructor(cod_estado, nom_estado){
        this.cod_estado = cod_estado;
        this.nom_estado = nom_estado;
    }
    to_json(){
        const json = {
            "cod_estado": this.cod_estado,
            "nom_estado": this.nom_estado,
        } 
        return json
    }
}

module.exports = Estado