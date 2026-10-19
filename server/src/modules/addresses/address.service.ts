import { prisma } from '../../db.js'
import { ApiError } from '../../lib/errors.js'
import { serializeAddress } from '../../lib/serialize.js'
import type { AddressInput } from './address.schemas.js'

export async function listAddresses(userId: string) {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return addresses.map(serializeAddress)
}

export async function createAddress(userId: string, input: AddressInput) {
  return prisma.$transaction(async (tx) => {
    const existingCount = await tx.address.count({ where: { userId } })
    const isDefault = input.isDefault || existingCount === 0

    if (isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } })
    }

    const address = await tx.address.create({
      data: { ...input, isDefault, userId },
    })
    return serializeAddress(address)
  })
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: Partial<AddressInput>,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id: addressId, userId } })
    if (!existing) {
      throw ApiError.notFound('Address not found')
    }

    if (input.isDefault === true) {
      await tx.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      })
    }

    const address = await tx.address.update({
      where: { id: addressId },
      data: input,
    })
    return serializeAddress(address)
  })
}

export async function setDefaultAddress(userId: string, addressId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id: addressId, userId } })
    if (!existing) {
      throw ApiError.notFound('Address not found')
    }

    await tx.address.updateMany({
      where: { userId, id: { not: addressId } },
      data: { isDefault: false },
    })

    const address = await tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    })
    return serializeAddress(address)
  })
}

export async function deleteAddress(userId: string, addressId: string) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id: addressId, userId } })
    if (!existing) {
      throw ApiError.notFound('Address not found')
    }

    await tx.address.delete({ where: { id: addressId } })

    if (existing.isDefault) {
      const replacement = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      if (replacement) {
        await tx.address.update({
          where: { id: replacement.id },
          data: { isDefault: true },
        })
      }
    }
  })
}
