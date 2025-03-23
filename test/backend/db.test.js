import { expect } from 'chai';
import mongoose from 'mongoose';
import { connectDB } from '../../backend/config/db.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('DB Connection', function () {
  let mongoServer;

  // Increase timeout to 10 seconds for setup
  this.timeout(10000); // Applies to all hooks and tests in this block

  before(async function () {
    // Disconnect any active connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    // Create in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
  });

  after(async function () {
    // Disconnect and stop server
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('should connect successfully', async function () {
    try {
      await connectDB();
      expect(mongoose.connection.readyState).to.equal(1);
    } catch (err) {
      console.error('❌ Failed to connect to in-memory MongoDB:', err);
      throw err; // Let Mocha handle it as a failure
    }
  });
});
