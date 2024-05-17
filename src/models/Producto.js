class ErrorPersonalizado extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorPersonalizado";
    }
}

class Producto {
    constructor(cod_producto, nom_producto, codigo, precio, descuento, tipo, modelo , estado, categoria){
        this.cod_producto = cod_producto;
        this.validarNombreProducto(nom_producto);
        this.validarCodigo(codigo);
        this.validarPrecio(precio);
        this.descuento = descuento;
        this.tipo = tipo;
        this.modelo = modelo;
        this.estado = estado;
        this.categoria = categoria;
    }
    
    to_json(){
        const json = {
            "cod_producto": this.cod_producto,
            "nom_producto": this.nom_producto,
            "codigo": this.codigo,
            "precio": this.precio,
            "descuento": this.descuento,
            "tipo": this.tipo.to_json(),
            "modelo": this.modelo.to_json(),
            "estado": this.estado.to_json(),
            "categoria": this.categoria.to_json()
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