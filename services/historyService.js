const historyRepository = require("../repositories/historyRepository");

class HistoryService {
  async getHistoryByDateRange(shop, start, end) {
    return historyRepository.findByDateRange(shop, start, end);
  }

  async createHistory(historyData, session = null) {
    return historyRepository.create(historyData, session);
  }

  async deleteHistory(query, session = null) {
    return historyRepository.deleteMany(query, session);
  }
}

module.exports = new HistoryService();
