import express from "express"
import cookieParser from "cookie-parser"
import authController from "./controllers/authController.js"

const app = express()

app.use(express.static("renovaai-front"))
app.use(express.json())
app.use(cookieParser())
app.use((req, res, next)=>{
    console.log(`${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Recife" })} ${new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Recife" })} | ${req.ip.replace(/^::ffff:/, "")} : ${req.method} ${req.originalUrl}`)
    next()
})

//Adicionar Controllers aqui
app.use(authController)

app.listen(Number(process.env.PORT), ()=>{
    console.log(`Servidor iniciado em http://localhost:${process.env.PORT}`)
})