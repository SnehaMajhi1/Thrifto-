const request = require('supertest');
const { createApp } = require('../app'); 

const app = createApp();

describe('Chat Endpoints', () => {
  it('should prevent access to chats without auth', async () => {
    const res = await request(app).get('/api/chats');
    expect(res.statusCode).toBe(401);
  });
});
