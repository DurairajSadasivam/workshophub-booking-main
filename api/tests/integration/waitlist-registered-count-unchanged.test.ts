import request from 'supertest'
import app from '../../src/app'

describe('POST /api/training-sessions/:id/registrations on a full session (registered count)', () => {
  it('leaves the registered count equal to capacity after a waitlisted registration', async () => {
    const sessionsResponse = await request(app).get('/api/training-sessions')
    expect(sessionsResponse.status).toBe(200)

    const full = (
      sessionsResponse.body as Array<{ id: number; registered: number; capacity: number }>
    ).find((s) => s.registered >= s.capacity)
    expect(full).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        registered: expect.any(Number),
        capacity: expect.any(Number),
      })
    )
    const sessionId: number = full!.id
    const capacity: number = full!.capacity

    const beforeResponse = await request(app).get(`/api/training-sessions/${sessionId}`)
    expect(beforeResponse.status).toBe(200)
    expect(beforeResponse.body.registered).toBe(capacity)

    const email = `test-waitlist-count+${Date.now()}@example.com`
    const postResponse = await request(app)
      .post(`/api/training-sessions/${sessionId}/registrations`)
      .send({ name: 'Waitlist Count Tester', email })

    expect(postResponse.status).toBe(202)
    expect(postResponse.body).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        position: expect.any(Number),
      })
    )
    expect(postResponse.body.status).toBe('waitlisted')

    const afterResponse = await request(app).get(`/api/training-sessions/${sessionId}`)
    expect(afterResponse.status).toBe(200)
    expect(afterResponse.body).toEqual(
      expect.objectContaining({ id: expect.any(Number), registered: expect.any(Number) })
    )
    expect(afterResponse.body.id).toBe(sessionId)
    expect(afterResponse.body.registered).toBe(capacity)
  })
})
