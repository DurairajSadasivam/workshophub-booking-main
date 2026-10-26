import type { Registration } from '@prisma/client'
import prisma from '../lib/prisma'

export async function getAllSessions() {
  return prisma.trainingSession.findMany({
    orderBy: { date: 'asc' },
  })
}

export async function getSessionById(id: number) {
  return prisma.trainingSession.findUnique({
    where: { id },
  })
}

export type CreateRegistrationResult =
  | { outcome: 'created'; registration: Registration }
  | { outcome: 'not_found' }
  | { outcome: 'full' }

export async function createRegistration(
  sessionId: number,
  name: string,
  email: string
): Promise<CreateRegistrationResult> {
  return prisma.$transaction(async (tx) => {
    const session = await tx.trainingSession.findUnique({ where: { id: sessionId } })
    if (!session) {
      return { outcome: 'not_found' as const }
    }

    const seat = await tx.trainingSession.updateMany({
      where: { id: sessionId, registered: { lt: session.capacity } },
      data: { registered: { increment: 1 } },
    })
    if (seat.count === 0) {
      return { outcome: 'full' as const }
    }

    const registration = await tx.registration.create({
      data: { sessionId, name, email },
    })
    return { outcome: 'created' as const, registration }
  })
}
