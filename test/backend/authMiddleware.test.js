import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../backend/middleware/authMiddleware.js';

describe('Auth Middleware', () => {
  // Helper: Create a fake response object
  function mockRes() {
    return {
      statusCode: 0,
      data: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.data = data;
        return this;
      }
    };
  }

  it('should return 401 if no token is provided', () => {
    const req = { header: () => null };
    const res = mockRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    authMiddleware(req, res, next);
    
    expect(res.statusCode).to.equal(401);
    expect(res.data).to.have.property('msg', 'No token, authorization denied');
    expect(nextCalled).to.be.false;
  });

  it('should return 401 for an invalid token', () => {
    const req = { header: () => "Bearer invalidtoken" };
    const res = mockRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // Temporarily override jwt.verify to simulate an invalid token error
    const originalVerify = jwt.verify;
    jwt.verify = () => { throw new Error('Invalid token'); };

    authMiddleware(req, res, next);

    // Restore original jwt.verify
    jwt.verify = originalVerify;

    expect(res.statusCode).to.equal(401);
    expect(res.data).to.have.property('msg', 'Invalid token');
    expect(nextCalled).to.be.false;
  });

  it('should call next and attach user if token is valid', () => {
    // Create a fake user payload and token (the token value isn't important here)
    const user = { id: 'user123', name: 'Test User' };
    const fakeToken = 'validtoken';

    // Override jwt.verify to return our fake payload
    const originalVerify = jwt.verify;
    jwt.verify = () => ({ user });

    const req = { header: () => "Bearer " + fakeToken };
    const res = mockRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    authMiddleware(req, res, next);

    // Restore jwt.verify
    jwt.verify = originalVerify;

    expect(req).to.have.property('user');
    expect(req.user).to.deep.equal(user);
    expect(nextCalled).to.be.true;
  });
});
