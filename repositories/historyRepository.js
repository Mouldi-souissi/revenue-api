const History = require("../models/History");

class HistoryRepository {
  async findByDateRange(shop, start, end) {
    return History.find({
      shop,
      date: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    }).sort({ date: -1 });
  }

  async create(historyData, session = null) {
    let options = {};

    if (session) {
      options = { session };
    }
    const history = new History(historyData);

    return history.save(options);
  }
}

module.exports = new HistoryRepository();
