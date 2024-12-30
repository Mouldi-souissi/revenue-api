const History = require("../models/History");
const database = require("../db/database");

class HistoryRepository {
  async findByDateRange(shop, start, end) {
    const query = {
      shop,
      date: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    };
    const options = { sort: { date: -1 } };
    return database.read(History, query, options);
  }

  async create(historyData, session = null) {
    const options = {};
    if (session) {
      options.session = session;
    }
    return database.create(History, historyData, options);
  }
}

module.exports = new HistoryRepository();
