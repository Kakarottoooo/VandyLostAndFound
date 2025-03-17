import { connect, disconnect } from './setupTestDB.js';
import { expect } from 'chai';

describe('In-Memory MongoDB Setup', () => {
  it('should connect and disconnect successfully', async () => {
    await connect();
    expect(1).to.equal(1); // Dummy assertion
    await disconnect();
  });
});
