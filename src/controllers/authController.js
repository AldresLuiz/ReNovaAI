import r from "express"
import { registerUser, loginUser } from "../services/authService.js"
import { authLoginDTO, authRegisterDTO } from "../datamodels/authDTO.js"

const router = r.Router()

router.post("/auth/register", (req, res)=>{
    const data = authRegisterDTO.safeParse(req.body)
    if(!data.success) return res.status(403).json(JSON.parse(data.error.message))

    const {name, email, password} = data.data
    // registerUser()
})

router.post("/auth/login", (req, res)=>{
    const data = authLoginDTO.safeParse(req.body)
    if(!data.success) return res.status(403).json(JSON.parse(data.error.message))

    const {email, password} = data.data
    // loginUser()
})

router.post("/auth/logout", (req, res)=>{
    
})

export default router