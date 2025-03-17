import { expect } from 'chai';
import mongoose from 'mongoose';
import User from '../../backend/models/user.js';
import { connect, disconnect, clearDatabase } from '../setupTestDB.js';

describe('User Model', function() {
  before(async () => {
    await connect();
  });

  after(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it('should create a user successfully with all required fields', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword'
    };

    const user = await User.create(userData);
    expect(user).to.have.property('_id');
    expect(user.name).to.equal('John Doe');
    expect(user.email).to.equal('john@example.com');
  });

  it('should throw a validation error if required fields are missing', async () => {
    let error = null;
    try {
      await User.create({ name: 'Jane Doe' }); // missing email and password
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error).to.have.property('errors');
    // Optionally, check for specific error messages, e.g., for email
    expect(error.errors).to.have.property('email');
  });
});
