class Categoria {
    constructor(cod_categoria, nom_categoria){
        this.cod_categoria = cod_categoria;
        this.nom_categoria = nom_categoria;
    }
    to_json(){
        const json = {
            "cod_categoria": this.cod_categoria,
            "nom_categoria": this.nom_categoria,
        } 
        return json
    }
}

module.exports = Categoria