import { expect } from 'chai';
import { createItem, getItems, deleteItem, updateItem } from '../../backend/controllers/item.controller.js';
import Item from '../../backend/models/item.model.js';
import { connect, disconnect, clearDatabase } from '../setupTestDB.js';

describe('Item Controller (Unit Tests with In-Memory DB)', function () {
  // Increase timeout to allow for DB operations
  this.timeout(10000);

  before(async () => {
    await connect();
  });

  after(async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Error during disconnect:', err);
    }
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  // Mock response object
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
        return this; // Allow chaining
      }
    };
  }

  it('createItem should create an item and return it', async () => {
    const req = {
      body: {
        name: 'Test Item',
        description: 'Test Description',
        dateFound: new Date().toISOString()
      }
    };
    const res = mockRes();

    await createItem(req, res);

    expect(res.statusCode).to.equal(201);
    expect(res.data).to.have.property('success', true);
    expect(res.data.data).to.include({ name: 'Test Item', description: 'Test Description' });
  });

  it('getItems should return empty array initially', async () => {
    const req = {};
    const res = mockRes();

    await getItems(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res.data).to.have.property('success', true);
    expect(res.data).to.have.property('data').that.is.an('array').that.is.empty;
  });

  it('updateItem should update an existing item', async () => {
    const item = await Item.create({
      name: 'Old Item',
      description: 'Old Desc',
      dateFound: new Date()
    });

    const req = {
      params: { id: item._id.toString() },
      body: { name: 'Updated Item' }
    };
    const res = mockRes();

    await updateItem(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res.data).to.have.property('success', true);
    expect(res.data.data).to.have.property('name', 'Updated Item');
  });

  it('deleteItem should remove the item', async () => {
    const item = await Item.create({
      name: 'Delete Me',
      description: 'To delete',
      dateFound: new Date()
    });

    const req = {
      params: { id: item._id.toString() }
    };
    const res = mockRes();

    await deleteItem(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res.data).to.have.property('success', true);
    expect(res.data).to.have.property('message').that.includes('deleted');
  });
});
