import request from 'supertest'
import app from '../../src/app'

describe('POST /api/training-sessions/:id/registrations', () => {
  it('returns 201 with registration details for an existing session', async () => {
    const sessionsResponse = await request(app).get('/api/training-sessions')
    expect(sessionsResponse.status).toBe(200)
    const openSession = (
      sessionsResponse.body as Array<{ id: number; registered: number; capacity: number }>
    ).find((s) => s.registered < s.capacity)
    expect(openSession).toBeDefined()

    const sessionId: number = openSession!.id

    const response = await request(app)
      .post(`/api/training-sessions/${sessionId}/registrations`)
      .send({ name: 'Ada Lovelace', email: `ada+${Date.now()}@example.com` })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
        sessionId: expect.any(Number),
      })
    )
    expect(response.body.name).toBe('Ada Lovelace')
    expect(response.body.email).toMatch(/^ada\+\d+@example\.com$/)
    expect(response.body.sessionId).toBe(sessionId)
  })
})
