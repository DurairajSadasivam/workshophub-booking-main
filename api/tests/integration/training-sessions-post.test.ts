import request from 'supertest'
import app from '../../src/app'

describe('POST /api/training-sessions', () => {
  it('returns 405 with empty body', async () => {
    const response = await request(app)
      .post('/api/training-sessions')
      .send({})
    expect(response.status).toBe(405)
  })
})
