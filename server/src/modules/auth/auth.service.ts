import bcrypt from 'bcryptjs'
import { prisma } from '../../db.js'
import { ApiError } from '../../lib/errors.js'
import { serializeUser } from '../../lib/serialize.js'
import type { LoginInput, RegisterInput } from './auth.schemas.js'

const SALT_ROUNDS = 12

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    throw ApiError.conflict('An account with this email already exists')
  }

  const password = await bcrypt.hash(input.password, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password,
      phone: input.phone,
    },
  })

  return serializeUser(user)
}

export async function authenticateUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  const passwordMatches = user ? await bcrypt.compare(input.password, user.password) : false

  if (!user || !passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  return serializeUser(user)
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] } },
  })

  if (!user) {
    throw ApiError.unauthorized('Your session is no longer valid')
  }

  const { addresses, ...userData } = user
  return serializeUser(userData, addresses)
}
