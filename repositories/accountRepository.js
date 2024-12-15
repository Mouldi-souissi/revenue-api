const Account = require("../models/Account");

class AccountRepository {
  async create(accountData) {
    const account = new Account(accountData);
    return account.save();
  }

  async findByShopId(shopId, session = null) {
    if (session) {
      return Account.find({ shopId }).session(session).sort({ _id: -1 });
    } else {
      return Account.find({ shopId }).sort({ _id: -1 });
    }
  }

  async findById(accountId) {
    return Account.findById(accountId);
  }

  async updateById(accountId, updateData, session = null) {
    let options = { new: true };
    if (session) {
      options.session = session;
    }
    return Account.findByIdAndUpdate(accountId, updateData, options);
  }

  async deleteById(accountId) {
    let options = {};
    if (session) {
      options.session = session;
    }
    return Account.findByIdAndDelete(accountId, options);
  }
}

module.exports = new AccountRepository();
