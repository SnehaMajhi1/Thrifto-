const request = require('supertest');
const { createApp } = require('../app'); 

const app = createApp();

describe('Auth Endpoints', () => {

  it('should FAIL to login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
