import request from 'supertest'
import app from '../../src/app'

describe('POST /api/training-sessions/:id/registrations registered count', () => {
  it('increments the session registered count by 1 after a successful registration', async () => {
    const sessionsResponse = await request(app).get('/api/training-sessions')
    expect(sessionsResponse.status).toBe(200)

    const available = (
      sessionsResponse.body as Array<{ id: number; registered: number; capacity: number }>
    ).find((s) => s.registered < s.capacity)
    expect(available).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        registered: expect.any(Number),
        capacity: expect.any(Number),
      })
    )
    const sessionId: number = available!.id

    const beforeResponse = await request(app).get(`/api/training-sessions/${sessionId}`)
    expect(beforeResponse.status).toBe(200)
    const before: number = beforeResponse.body.registered
    expect(before).toEqual(expect.any(Number))

    const email = `grace.hopper+${Date.now()}@example.com`
    const postResponse = await request(app)
      .post(`/api/training-sessions/${sessionId}/registrations`)
      .send({ name: 'Grace Hopper', email })

    expect(postResponse.status).toBe(201)
    expect(postResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
        sessionId: expect.any(Number),
      })
    )
    expect(postResponse.body.sessionId).toBe(sessionId)

    const afterResponse = await request(app).get(`/api/training-sessions/${sessionId}`)
    expect(afterResponse.status).toBe(200)
    expect(afterResponse.body).toEqual(
      expect.objectContaining({ id: expect.any(Number), registered: expect.any(Number) })
    )
    expect(afterResponse.body.id).toBe(sessionId)
    expect(afterResponse.body.registered).toBe(before + 1)
  })
})
