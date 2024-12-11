const historyRepository = require("../repositories/historyRepository");

class HistoryService {
  async getHistoryByDateRange(shop, start, end) {
    if (!start || !end) {
      throw new Error("Invalid time interval");
    }
    return historyRepository.findByDateRange(shop, start, end);
  }

  async createHistory(historyData, session = null) {
    if (!historyData) {
      throw new Error("Invalid history data");
    }
    return historyRepository.create(historyData, session);
  }
}

module.exports = new HistoryService();
