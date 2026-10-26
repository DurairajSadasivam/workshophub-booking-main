// @ts-ignore
import request from 'supertest'
import app from '../../src/app'

describe('POST /api/training-sessions/:id/registrations', () => {
  it('returns 201 with registration details for an existing session', async () => {
    const sessionsResponse = await request(app).get('/api/training-sessions')
    expect(sessionsResponse.status).toBe(200)
    expect(sessionsResponse.body.length).toBeGreaterThan(0)

    const sessionId: number = sessionsResponse.body[0].id

    const response = await request(app)
      .post(`/api/training-sessions/${sessionId}/registrations`)
      .send({ name: 'Ada Lovelace', email: 'ada@example.com' })

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
    expect(response.body.email).toBe('ada@example.com')
    expect(response.body.sessionId).toBe(sessionId)
  })
})
