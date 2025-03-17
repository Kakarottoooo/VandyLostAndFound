import { expect } from 'chai';
import mongoose from 'mongoose';
import { connectDB } from '../../backend/config/db.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('DB Connection', function() {
  let mongoServer;
  
  before(async function() {
    // Disconnect any active connection first.
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    // Create a new in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    // Set the connection string for connectDB
    process.env.MONGO_URI = mongoServer.getUri();
  });

  after(async function() {
    // Disconnect and stop the in-memory server
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('should connect successfully', async function() {
    await connectDB();
    // readyState 1 means connected
    expect(mongoose.connection.readyState).to.equal(1);
  });
});
