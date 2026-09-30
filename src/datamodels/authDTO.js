import z from "zod"

export const authLoginDTO = z.object({
    email: z.email(),
    password: z.string().min(8).max(72)
})

export const authRegisterDTO = z.object({
    name: z.string().min(3).max(72),
    email: z.email(),
    password: z.string().min(8).max(72)
})

export const authMiddlewareDTO = z.object({
    userId: z.uuid(),
    role: z.int()
})