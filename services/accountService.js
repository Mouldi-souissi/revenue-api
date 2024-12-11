const accountRepository = require("../repositories/accountRepository");

class AccountService {
  async createAccount(accountData, currentUser) {
    const { name, deposit, rate } = accountData;

    if (!name || !deposit || !rate) {
      throw new Error("Invalid payload");
    }

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
}

module.exports = new AccountService();
