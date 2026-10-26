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

export async function createRegistration(sessionId: number, name: string, email: string) {
  return prisma.registration.create({
    data: { sessionId, name, email },
  })
}
