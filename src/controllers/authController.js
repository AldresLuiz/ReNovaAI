import r from "express"
import { registerUser, loginUser } from "../services/authService.js"
import { authLoginDTO, authRegisterDTO } from "../datamodels/authDTO.js"

const router = r.Router()

router.post("/auth/register", (req, res)=>{
    const data = authRegisterDTO.safeParse(req.body)
    if(!data.success) return res.status(400).json(JSON.parse(data.error.message))

    const {name, email, password} = data.data
    return registerUser(res, name, email, password)
})

router.post("/auth/login", (req, res)=>{
    const data = authLoginDTO.safeParse(req.body)
    if(!data.success) return res.status(400).json(JSON.parse(data.error.message))

    const {email, password} = data.data
    return loginUser(res, email, password)
})

router.get("/auth/logout", (req, res)=>{
    res.clearCookie("access")
    return res.status(200).json({message: "Logout efetuado com sucesso"})
})

export default router