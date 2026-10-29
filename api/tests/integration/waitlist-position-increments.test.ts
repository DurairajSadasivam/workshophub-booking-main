import request from 'supertest'
import app from '../../src/app'

describe('POST /api/training-sessions/:id/registrations waitlist position', () => {
  it('returns 202 waitlisted for two consecutive registrations on a full session, with the second position being the first plus 1', async () => {
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

    const stamp = Date.now()

    const first = await request(app)
      .post(`/api/training-sessions/${sessionId}/registrations`)
      .send({ name: 'Waitlist Tester A', email: `test-waitlist-pos-a+${stamp}@example.com` })

    const second = await request(app)
      .post(`/api/training-sessions/${sessionId}/registrations`)
      .send({ name: 'Waitlist Tester B', email: `test-waitlist-pos-b+${stamp}@example.com` })

    expect(first.status).toBe(202)
    expect(first.body).toEqual(
      expect.objectContaining({ status: 'waitlisted', position: expect.any(Number) })
    )
    expect(second.status).toBe(202)
    expect(second.body).toEqual(
      expect.objectContaining({ status: 'waitlisted', position: expect.any(Number) })
    )

    expect(Number.isInteger(first.body.position)).toBe(true)
    expect(first.body.position).toBeGreaterThanOrEqual(1)
    expect(second.body.position).toBe(first.body.position + 1)
  })
})
