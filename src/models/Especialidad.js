class Especialidad {
    constructor(cod_especialidad, nom_especialidad=""){
        this.cod_especialidad = cod_especialidad;
        this.nom_especialidad = nom_especialidad;
    }
    to_json(){
        const json = {
            "cod_especialidad": this.cod_especialidad,
            "nom_especialidad": this.nom_especialidad,
        } 
        return json
    }
}

module.exports = Especialidad