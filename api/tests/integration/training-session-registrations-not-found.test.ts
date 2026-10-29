import request from 'supertest'
import app from '../../src/app'

describe('POST /api/training-sessions/:id/registrations', () => {
  it('returns 404 with an error message when the session does not exist', async () => {
    const response = await request(app)
      .post('/api/training-sessions/999999/registrations')
      .send({ name: 'Ada Lovelace', email: 'ada@example.com' })

    expect(response.status).toBe(404)
    expect(response.body).toEqual(expect.objectContaining({ error: expect.any(String) }))
    expect(response.body.error).toBe('Training session not found')
  })
})
