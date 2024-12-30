const Account = require("../models/Account");
const database = require("../db/database");

class AccountRepository {
  async create(accountData) {
    return database.create(Account, accountData);
  }

  async findByShopId(shopId, session = null) {
    const options = { sort: { _id: -1 } };
    if (session) {
      options.session = session;
    }
    return database.read(Account, { shopId }, options);
  }

  async findById(accountId, session = null) {
    const options = {};
    if (session) {
      options.session = session;
    }
    return database.readOne(Account, { _id: accountId }, options);
  }

  async updateById(accountId, updateData, session = null) {
    const options = { new: true };
    if (session) {
      options.session = session;
    }
    return database.update(Account, { _id: accountId }, updateData, options);
  }

  async deleteById(accountId, session = null) {
    const options = {};
    if (session) {
      options.session = session;
    }
    return database.delete(Account, { _id: accountId }, options);
  }
}

module.exports = new AccountRepository();
