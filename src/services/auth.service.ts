import prisma from "../config/database"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { env } from "../config/env"
import logger from "../utils/logger"

export async function registerUser(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw Object.assign(new Error("Email already registered"), { statusCode: 409 })
  }

  // cost factor 12 is the standard recommendation for bcrypt
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, createdAt: true },
  })

  logger.info({ email }, "user registered")
  return user
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })

  // same error for wrong email and wrong password — don't leak which one
  if (!user) {
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 })
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  )

  logger.info({ email }, "user logged in")
  return {
    token,
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
  }
}
