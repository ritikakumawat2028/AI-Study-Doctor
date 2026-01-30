const request = require('supertest');
const { expect } = require('chai');
const app = require('../index');

describe('Integration tests for AI endpoints', function() {
  this.timeout(15000);
  let token;
  const email = `test+${Date.now()}@example.com`;

  it('registers a new user', async () => {
    const username = `testuser${Date.now()}`;
    const res = await request(app)
      .post('/api/register')
      .send({ username, email, password: 'password123' });

    // Expect 201 for new user (no unique constraint failures)
    expect(res.status).to.equal(201);
  });

  it('logs in and receives a token', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email, password: 'password123' });

    expect(res.status).to.equal(200);
    expect(res.body.token).to.be.a('string');
    token = res.body.token;
  });

  it('accepts structured intent on /api/gemini and returns text', async () => {
    const res = await request(app)
      .post('/api/gemini')
      .set('Authorization', `Bearer ${token}`)
      .send({ intent: { module: 'tutor', subject: 'Math', input: 'Explain 1+1' } });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('text');
    expect(res.body.text).to.be.a('string');
  });

  it('handles malformed python input gracefully', async () => {
    const res = await request(app)
      .post('/api/gemini')
      .set('Authorization', `Bearer ${token}`)
      .send({ intent: { module: 'tutor', input: '```python\nprint("hello")' } });

    expect(res.status).to.equal(200);
    expect(res.body.text).to.be.a('string');
  });

  it('responds to wellness chat and returns text', async () => {
    const res = await request(app)
      .post('/api/wellness/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'I am feeling stressed today' });

    expect(res.status).to.equal(200);
    expect(res.body.text).to.be.a('string');
  });
});