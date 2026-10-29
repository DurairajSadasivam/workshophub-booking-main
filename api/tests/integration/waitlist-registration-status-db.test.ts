import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import app from '../../src/app'

describe('Waitlisted registrations are persisted with status "waitlisted"', () => {
  const prisma = new PrismaClient()
  const email = `test-waitlist-db+${Date.now()}@example.com`

  afterAll(async () => {
    await prisma.registration.deleteMany({ where: { email } })
    await prisma.$disconnect()
  })

  it('stores the registration row with status "waitlisted" for a full session', async () => {
    const sessionsResponse = await request(app).get('/api/training-sessions')
    expect(sessionsResponse.status).toBe(200)

    const fullSession = (
      sessionsResponse.body as Array<{ id: number; registered: number; capacity: number }>
    ).find((s) => s.registered >= s.capacity)
    expect(fullSession).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        registered: expect.any(Number),
        capacity: expect.any(Number),
      })
    )
    const sessionId: number = fullSession!.id

    const response = await request(app)
      .post(`/api/training-sessions/${sessionId}/registrations`)
      .send({ name: 'Test Waitlister DB', email })

    expect(response.status).toBe(202)

    const row = await prisma.registration.findFirst({ where: { email } })
    expect(row).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        sessionId: expect.any(Number),
        email: expect.any(String),
        status: expect.any(String),
      })
    )
    expect(row!.status).toBe('waitlisted')
    expect(row!.sessionId).toBe(sessionId)
  })
})
