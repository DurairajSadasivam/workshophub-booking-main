import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import app from '../../src/app'

const prisma = new PrismaClient()

describe('POST /api/training-sessions/:id/registrations when session has space', () => {
  let email: string | undefined
  let sessionId: number | undefined
  let originalRegistered: number | undefined

  afterAll(async () => {
    try {
      if (email !== undefined) {
        await prisma.registration.deleteMany({ where: { email } })
      }
      if (sessionId !== undefined && originalRegistered !== undefined) {
        await prisma.trainingSession.update({
          where: { id: sessionId },
          data: { registered: originalRegistered },
        })
      }
    } finally {
      await prisma.$disconnect()
    }
  })

  it('returns 201 with status "confirmed" and stores the registration as confirmed', async () => {
    const sessionsResponse = await request(app).get('/api/training-sessions')
    expect(sessionsResponse.status).toBe(200)

    const openSession = (
      sessionsResponse.body as Array<{ id: number; registered: number; capacity: number }>
    ).find((s) => s.registered < s.capacity)
    expect(openSession).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        registered: expect.any(Number),
        capacity: expect.any(Number),
      })
    )

    sessionId = openSession!.id
    originalRegistered = openSession!.registered
    email = `test-confirmed+${Date.now()}@example.com`

    const response = await request(app)
      .post(`/api/training-sessions/${sessionId}/registrations`)
      .send({ name: 'Test Confirmed', email })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        sessionId: expect.any(Number),
        status: expect.any(String),
      })
    )
    expect(response.body.sessionId).toBe(sessionId)
    expect(response.body.status).toBe('confirmed')

    const row = await prisma.registration.findFirst({ where: { email } })
    expect(row).not.toBeNull()
    expect(row!.status).toBe('confirmed')
  })
})
