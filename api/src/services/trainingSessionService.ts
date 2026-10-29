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
  | { outcome: 'waitlisted'; registration: Registration; position: number }
  | { outcome: 'not_found' }

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
      const registration = await tx.registration.create({
        data: { sessionId, name, email, status: 'waitlisted' },
      })
      const position = await tx.registration.count({
        where: { sessionId, status: 'waitlisted', id: { lte: registration.id } },
      })
      return { outcome: 'waitlisted' as const, registration, position }
    }

    const registration = await tx.registration.create({
      data: { sessionId, name, email, status: 'confirmed' },
    })
    return { outcome: 'created' as const, registration }
  })
}
