import crypto from "crypto"
import pool from "./databaseService.js"
import { hash, compare } from "bcrypt"
import jwt from "jsonwebtoken"

export async function registerUser(res, name, email, password){
    const userId = await crypto.randomUUID()
    const dbRequest = await pool.query(`
        INSERT INTO users (
        name,
        email,
        password,
        role,
        "userId"
        ) VALUES ($1, $2, $3, 0, $4)
        ON CONFLICT (email) DO NOTHING
        RETURNING *
        `, [name, email, await hash(password, 10), userId])
    
    if(dbRequest.rowCount==0) return res.status(400).json({error: "Email já existente"})
    return res.status(200).json({message:"Usuario criado com sucesso"})
}

export async function loginUser(res, email, password) {
    const dbRequest = await pool.query(`
        SELECT
        "userId",
        email,
        password,
        role
        FROM users
        WHERE email = $1
        LIMIT 1
        `, [email])
    
    // Email incorreto
    if(dbRequest.rowCount==0) return res.status(400).json({error: "Email ou senha incorretos"})
    
    const user = dbRequest.rows[0]

    // Senha incorreta
    if(!compare(password, user.password)) return res.status(400).json({error: "Email ou senha incorretos"})
    
    const token = jwt.sign({
        userId: user.userId,
        role: user.role
    }, process.env.JWT_SECRET,{
        expiresIn: "2h"
    })

    res.cookie("access", token)
    
    return res.status(200).json({message: "Login efetuado com sucesso"})
}