const accountRepository = require("../repositories/accountRepository");

class AccountService {
  async createAccount(accountData, currentUser) {
    const { name, deposit, rate } = accountData;

    const newAccount = {
      name,
      deposit,
      rate,
      shop: currentUser.shop,
      shopId: currentUser.shopId,
    };

    return accountRepository.create(newAccount);
  }

  async getAccounts(shopId, session = null) {
    return accountRepository.findByShopId(shopId, session);
  }

  async updateAccount(accountId, updateData, session = null) {
    return accountRepository.updateById(accountId, updateData, session);
  }

  async deleteAccount(accountId, session = null) {
    return accountRepository.deleteById(accountId, session);
  }

  async deleteAccounts(query, session = null) {
    return accountRepository.deleteMany(query, session);
  }

  async update(query, update, session = null) {
    return accountRepository.update(query, update, session);
  }
}

module.exports = new AccountService();
