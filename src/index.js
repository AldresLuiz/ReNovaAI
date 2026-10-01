import express from "express"
import cookieParser from "cookie-parser"
import authController from "./controllers/authController.js"
import geocodificarController from "./controllers/geocodificarController.js"
import { fileURLToPath } from "url";
import path from "path";
import { corsMiddleware } from "./middleware/corsMiddleware.js"
import { erroMiddleware, rotaNaoEncontrada } from "./middleware/erroMiddleware.js"

const app = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../renovaai-front")))
app.use(express.json())
app.use(cookieParser())
app.use((req, res, next)=>{
    // req.path em vez de originalUrl: não loga lat/lng do usuário (RNF07)
    console.log(`${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Recife" })} ${new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Recife" })} | ${req.ip.replace(/^::ffff:/, "")} : ${req.method} ${req.path}`)
    next()
})

//Adicionar Controllers aqui
app.use(authController)
app.use(geocodificarController)

app.use(rotaNaoEncontrada)       // sempre depois de todas as rotas
app.use(erroMiddleware)          // sempre por último

app.listen(Number(process.env.PORT), ()=>{
    console.log(`Servidor iniciado em http://localhost:${process.env.PORT}`)
})
