class ErrorPersonalizado extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorPersonalizado";
    }
}

class Usuario {
    constructor(run, nombre, correo, contrasenia, es_empleado, especialidad) {
        this.validarRun(run);
        this.validarNombre(nombre);
        this.validacionCorreo(correo);
        this.validarContrasenia(contrasenia);
        this.es_empleado = es_empleado;
        this.especialidad = especialidad
    }

    to_json() {
        const json = {
            "run": this.run,
            "nombre": this.nombre,
            "correo": this.correo,
            "contrasenia": this.contrasenia,
            "es_empleado": this.es_empleado,
            "especialidad": this.especialidad.to_json()
        }
        return json
    }


    // Aqui comienza la validacion de RUN
    validarRun(run) {
        if (!run || !this.validarFormatoRun(run) || !this.validarDigitoVerificador(run)) {
            throw new ErrorPersonalizado('Formato incorrecto o RUN invalido');
        }
        this.run = run;
    }
    
    validarFormatoRun(run) {
        // Expresión regular para validar el formato del RUN (XXXXXXXX-Y)
        const regex = /^\d{7,8}-[\dkK]$/;
        return regex.test(run);
    }
    
    validarDigitoVerificador(run) {
        // Eliminar guión del RUN
        const cleanRun = run.replace(/[-]/g, '');
        const rut = cleanRun.slice(0, -1);
        const dv = cleanRun.slice(-1).toUpperCase();
    
        // Algoritmo para calcular el dígito verificador
        let suma = 0;
        let multiplo = 2;
    
        // Recorrer el RUT de derecha a izquierda y multiplicar cada dígito por un factor
        for (let i = rut.length - 1; i >= 0; i--) {
            suma += parseInt(rut.charAt(i)) * multiplo;
            multiplo = multiplo < 7 ? multiplo + 1 : 2;
        }
    
        // Calcular el dígito verificador esperado
        const dvEsperado = 11 - (suma % 11);
    
        // Comparar el dígito verificador calculado con el ingresado
        return (dv === (dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado).toString());
    }
    // Aqui termina la validacion del RUN



    // Aqui comienza la validacion del nombre (que no venga vacio)
    validarNombre(nombre) {
        if (!nombre || nombre.trim() === '') {
            throw new ErrorPersonalizado('El nombre no puede estar vacío');
        }
        this.nombre = nombre;
    }
    // Aqui termina la validacion del nombre



    // Aqui comienza la validacion del correo (formato)
    validacionCorreo(correo) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar el correo electrónico
        if (!regex.test(correo)) {
            throw new ErrorPersonalizado('El correo electrónico no es válido');
        }
        this.correo = correo;
    }
    // Aqui termina la validacion del correo



    validarContrasenia(contrasenia) {
        if (!contrasenia || contrasenia.trim() === '') {
            throw new ErrorPersonalizado('La contraseña no puede estar vacía');
        }
    }
}

module.exports = Usuario