import request from 'supertest'
import app from '../../src/app'

describe('POST /api/training-sessions/:id/registrations when session is full', () => {
  it('returns 409 with an error message and does not exceed capacity', async () => {
    const sessionsResponse = await request(app).get('/api/training-sessions')
    expect(sessionsResponse.status).toBe(200)

    const full = (
      sessionsResponse.body as Array<{
        id: number
        title: string
        registered: number
        capacity: number
      }>
    ).find((s) => s.title === 'Full Workshop Fixture')
    expect(full).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        registered: expect.any(Number),
        capacity: expect.any(Number),
      })
    )
    expect(full!.registered).toBeGreaterThanOrEqual(full!.capacity)
    const sessionId: number = full!.id

    const postResponse = await request(app)
      .post(`/api/training-sessions/${sessionId}/registrations`)
      .send({ name: 'Late Comer', email: 'late.comer@example.com' })

    expect(postResponse.status).toBe(409)
    expect(postResponse.body).toEqual(expect.objectContaining({ error: expect.any(String) }))
    expect(postResponse.body.error.length).toBeGreaterThan(0)

    const afterResponse = await request(app).get(`/api/training-sessions/${sessionId}`)
    expect(afterResponse.status).toBe(200)
    expect(afterResponse.body.registered).toBe(2)
    expect(afterResponse.body.registered).toBe(afterResponse.body.capacity)
  })
})
