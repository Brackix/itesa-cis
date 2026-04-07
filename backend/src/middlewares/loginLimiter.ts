import rateLimit from 'express-rate-limit';

/**
 * Buffer de seguridad para el login.
 * Limita a 5 intentos cada 15 minutos por dirección IP.
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Límite de 5 peticiones por ventana
    handler: (req, res, _next, options) => {
        const resetTime = (req as any).rateLimit?.resetTime;
        const timeStr = resetTime 
            ? resetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : "dentro de un momento";
            
        res.status(options.statusCode).json({
            success: false,
            error: `Has intentado loguearte demasiadas veces. Por seguridad, podrás volver a intentarlo a las ${timeStr}.`
        });
    },

    standardHeaders: true, 
    legacyHeaders: false, 
});
