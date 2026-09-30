import jwt from "jsonwebtoken"

export function authMiddleware(req, res, next){
    const cookie = req.cookies.access
    if(!cookie) return res.status(401).json({error: "É necessario estar autenticado"})

    try{
        const token = jwt.verify(cookie, process.env.JWT_SECRET)
        req.user = {
            userId: token.userId,
            role: token.role
        }
        next()
    } catch (e) {
        return res.status(401).json({error: "Credenciais invalidas"})
    }
}