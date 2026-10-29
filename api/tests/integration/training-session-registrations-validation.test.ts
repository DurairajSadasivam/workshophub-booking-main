import request from 'supertest'
import app from '../../src/app'

describe('POST /api/training-sessions/:id/registrations validation', () => {
  it('returns 400 with an error message when required fields are missing and registers nobody', async () => {
    const sessionsResponse = await request(app).get('/api/training-sessions')
    expect(sessionsResponse.status).toBe(200)

    const session = (
      sessionsResponse.body as Array<{ id: number; registered: number; capacity: number }>
    ).find((s) => s.registered < s.capacity)
    expect(session).toBeDefined()
    const sessionId: number = session!.id

    const beforeResponse = await request(app).get(`/api/training-sessions/${sessionId}`)
    expect(beforeResponse.status).toBe(200)
    const registeredBefore: number = beforeResponse.body.registered

    const response = await request(app)
      .post(`/api/training-sessions/${sessionId}/registrations`)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        error: expect.any(String),
      })
    )
    expect(response.body.error.length).toBeGreaterThan(0)

    const afterResponse = await request(app).get(`/api/training-sessions/${sessionId}`)
    expect(afterResponse.status).toBe(200)
    expect(afterResponse.body.registered).toBe(registeredBefore)
  })
})
