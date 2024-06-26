const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
        if (err) {
            return res.status(403).json({ mensaje: 'Token inválido.' });
        }
        
        // Extraer el ID y el rol del token decodificado
        const { usuario, rol } = decodedToken;

        // Adjuntar la información del usuario y su rol al objeto req
        req.user = {
            run: usuario.run,
            nombre: usuario.nombre,
            rol: rol
        };

        next();
    });
};

module.exports = authenticateToken;
