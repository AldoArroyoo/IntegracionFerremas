class Modelo {
    constructor(cod_modelo, nom_modelo, marca){
        this.cod_modelo = cod_modelo;
        this.nom_modelo = nom_modelo;
        this.marca = marca;
    }
    to_json(){
        const json = {
            "cod_modelo": this.cod_modelo,
            "nom_modelo": this.nom_modelo,
            "marca": this.marca.to_json()
        } 
        return json
    }
}

module.exports = Modelo