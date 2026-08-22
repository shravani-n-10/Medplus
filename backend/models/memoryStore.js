/**
 * Lightweight In-Memory Data Store Fallback
 * Ensures 100% standalone reliability when local MongoDB or binary download is unavailable.
 */

const crypto = require('crypto');

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.items = [];
  }

  async findOne(query) {
    return this.items.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  }

  async find(query = {}) {
    let result = this.items.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) return false;
      }
      return true;
    });

    const chain = {
      select: () => chain,
      sort: (sortObj) => {
        const key = Object.keys(sortObj)[0];
        const dir = sortObj[key];
        result.sort((a, b) => (dir < 0 ? (b[key] > a[key] ? 1 : -1) : (a[key] > b[key] ? 1 : -1)));
        return chain;
      },
      limit: (n) => {
        result = result.slice(0, n);
        return chain;
      },
      then: (resolve) => resolve(result)
    };
    return chain;
  }

  async findById(id) {
    return this.items.find(item => item._id.toString() === id.toString()) || null;
  }

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  }

  async create(data) {
    const doc = {
      _id: crypto.randomBytes(12).toString('hex'),
      createdAt: new Date(),
      ...data,
      save: async function() { return this; }
    };
    this.items.push(doc);
    return doc;
  }
}

class MemoryStore {
  constructor() {
    this.users = new MemoryCollection('users');
    this.medicalImages = new MemoryCollection('medicalImages');
    this.auditLogs = new MemoryCollection('auditLogs');
  }
}

module.exports = new MemoryStore();
