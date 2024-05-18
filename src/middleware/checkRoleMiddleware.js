const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ mensaje: 'Acceso prohibido. Rol no autorizado.' });
        }
        next();
    };
};


module.exports = checkRole;