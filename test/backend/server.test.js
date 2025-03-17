import request from 'supertest';
import { expect } from 'chai';
import app from '../../backend/server.js';

describe('Server', function() {
  it('GET / should return welcome message', async function() {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.equal('🔗 Welcome to VandyLostAndFound API');
  });
});
