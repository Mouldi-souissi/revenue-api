const Move = require("../models/Move");

class MoveRepository {
  async find(query) {
    return await Move.find(query).sort({ date: -1 });
  }

  async findById(id) {
    return await Move.findById(id);
  }

  async save(move, session = null) {
    return await move.save({ session });
  }

  async deleteById(id, session = null) {
    return await Move.findByIdAndRemove(id, { session });
  }
}

module.exports = new MoveRepository();
