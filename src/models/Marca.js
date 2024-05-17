class Marca {
    constructor(cod_marca, nom_marca){
        this.cod_marca = cod_marca;
        this.nom_marca = nom_marca;
    }
    to_json(){
        const json = {
            "cod_marca": this.cod_marca,
            "nom_marca": this.nom_marca,
        } 
        return json
    }
}

module.exports = Marca