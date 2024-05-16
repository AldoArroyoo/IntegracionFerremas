class ErrorPersonalizado extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorPersonalizado";
    }
}

class Producto {
    constructor(cod_producto, nom_producto, codigo, precio, modelo, tipo_prod, promocion){
        this.cod_producto = cod_producto;
        this.validarNombreProducto(nom_producto);
        this.validarCodigo(codigo);
        this.validarPrecio(precio);
        this.modelo = modelo;
        this.tipo_producto = tipo_prod;
        this.promocion = promocion;
    }
    
    to_json(){
        const json = {
            "cod_producto": this.cod_producto,
            "nom_producto": this.nom_producto,
            "codigo": this.codigo,
            "precio": this.precio,
            "cod_modelo": this.modelo.to_json(),
            "tipo_prod": this.tipo_producto.to_json(),
            "promocion": this.promocion,
        } 
        return json
    }

    validarNombreProducto(nom_producto) {
        if (!nom_producto || nom_producto.trim() === '') {
            throw new ErrorPersonalizado('El nombre no puede estar vacío');
        }
        this.nom_producto= nom_producto;
    }



    validarCodigo(codigo) {
        if (!codigo || codigo.trim() === '') {
            throw new ErrorPersonalizado('El codigo no puede estar vacío');
        }
        this.codigo= codigo;
    }



    validarPrecio(precio) {
        if (precio <= 0) {
            throw new ErrorPersonalizado('El precio debe ser mayor que 0');
        }
    }

}

module.exports = Producto