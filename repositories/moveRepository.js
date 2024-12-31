const Move = require("../models/Move");
const database = require("../db/database");

class MoveRepository {
  async find(query, session = null) {
    const options = { sort: { date: -1 } };
    if (session) {
      options.session = session;
    }
    return database.read(Move, query, options);
  }

  async findById(id, session = null) {
    const options = {};
    if (session) {
      options.session = session;
    }
    return database.readOne(Move, { _id: id }, options);
  }

  async save(moveData, session = null) {
    const options = {};
    if (session) {
      options.session = session;
    }
    return database.create(Move, moveData, options);
  }

  async deleteById(id, session = null) {
    const options = {};
    if (session) {
      options.session = session;
    }
    return database.delete(Move, { _id: id }, options);
  }
  async deleteMany(query, session = null) {
    const options = {};
    if (session) {
      options.session = session;
    }
    return database.deleteMany(Move, query, options);
  }
}

module.exports = new MoveRepository();
