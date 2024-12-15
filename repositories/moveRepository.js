const Move = require("../models/Move");

class MoveRepository {
  async find(query) {
    return Move.find(query).sort({ date: -1 });
  }

  async findById(id) {
    return Move.findById(id);
  }

  async save(move, session = null) {
    return move.save({ session });
  }

  async deleteById(id, session = null) {
    return Move.findByIdAndRemove(id, { session });
  }
}

module.exports = new MoveRepository();
