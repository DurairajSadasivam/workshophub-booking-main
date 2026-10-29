import request from 'supertest'
import app from '../../src/app'

describe('POST /api/training-sessions/:id/registrations when session is full', () => {
  it('returns 202 with status "waitlisted" and a waitlist position', async () => {
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
      .send({ name: 'Test Waitlister', email: `test-waitlist-202+${Date.now()}@example.com` })

    expect(response.status).toBe(202)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        position: expect.any(Number),
      })
    )
    expect(response.body.status).toBe('waitlisted')
    expect(Number.isInteger(response.body.position)).toBe(true)
    expect(response.body.position).toBeGreaterThanOrEqual(1)
  })
})
