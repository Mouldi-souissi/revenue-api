const moveRepository = require("../repositories/moveRepository");
const accountService = require("./accountService");
const historyService = require("./historyService");
const {
  MOVE_SUBTYPES,
  MOVE_TYPES,
  PERIOD_VALUES,
  ACCOUNT_TYPES,
} = require("../constants");
const {
  getTodayRange,
  getYesterdayRange,
  getWeekRange,
  getMonthRange,
} = require("../helpers/dateAndTime");
const mongoose = require("mongoose");
const Move = require("../models/Move");
const History = require("../models/History");

class MoveService {
  async getMovesByPeriod(period, subType, shopId) {
    let query = { shopId };

    if (period === PERIOD_VALUES.daily) {
      const { start, end } = getTodayRange();
      query.date = { $gte: start, $lte: end };
    }
    if (period === PERIOD_VALUES.yesterday) {
      const { start, end } = getYesterdayRange();
      query.date = { $gte: start, $lt: end };
    }
    if (period === PERIOD_VALUES.weekly) {
      const { start, end } = getWeekRange();
      query.date = { $gte: start, $lt: end };
    }
    if (period === PERIOD_VALUES.monthly) {
      const { start, end } = getMonthRange();
      query.date = { $gte: start, $lt: end };
    }

    if (subType && subType !== "all") {
      query.subType = subType;
    }

    return await moveRepository.find(query);
  }

  async calculateRevenue(start, end, user, shopId) {
    let query = {
      shopId,
      date: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    };

    if (user && user !== "all") {
      query.user = user;
    }

    const moves = await moveRepository.find(query);

    let totalSales = 0;
    let totalWins = 0;
    let totalSpending = 0;
    let revenue = 0;

    for (let move of moves) {
      if (move.subType === MOVE_SUBTYPES.sale) {
        totalSales += Number(move.amount);
      }
      if (move.subType === MOVE_SUBTYPES.win) {
        totalWins += Number(move.amount);
      }
      if (move.subType === MOVE_SUBTYPES.spending) {
        totalSpending += Number(move.amount);
      }
    }

    revenue = totalSales - totalWins - totalSpending;

    return { totalSales, totalWins, totalSpending, revenue };
  }

  async createMove(data, user) {
    const session = await mongoose.startSession().catch((err) => {
      console.error("Error starting session:", err);
      throw error("Internal server error");
    });

    if (!session) return;

    try {
      const { type, amount, account, description, subType, accountId } = data;

      const accounts = await accountService.getAccounts(user.shopId);
      const primaryAccount = accounts.find(
        (acc) => acc.type === ACCOUNT_TYPES.primary,
      );
      const moveAccount = accounts.find((acc) => acc.name === account);

      if (!primaryAccount || !moveAccount) {
        throw error("error finding primaryAccount or moveAccount");
      }

      await session.startTransaction();

      const move = new Move({
        type,
        subType,
        amount,
        account,
        description,
        accountId,
        user: user.name,
        date: new Date(),
        shop: user.shop,
        shopId: user.shopId,
        userId: user.id,
      });

      const createdMove = await moveRepository.save(move, session);

      if (subType === MOVE_SUBTYPES.win) {
        await accountService.updateAccount(
          moveAccount._id,
          {
            lastMove: { type: MOVE_TYPES.in, amount },
            deposit: Number(moveAccount.deposit) + Number(amount),
          },
          session,
        );

        await accountService.updateAccount(
          primaryAccount._id,
          {
            lastMove: { type: MOVE_TYPES.out, amount },
            deposit: Number(primaryAccount.deposit) - Number(amount),
          },
          session,
        );
      }

      if (subType === MOVE_SUBTYPES.spending) {
        await accountService.updateAccount(
          primaryAccount._id,
          {
            lastMove: { type: MOVE_TYPES.out, amount },
            deposit: Number(primaryAccount.deposit) - Number(amount),
          },
          session,
        );
      }

      if (subType === MOVE_SUBTYPES.sale) {
        await accountService.updateAccount(
          primaryAccount._id,
          {
            lastMove: { type: MOVE_TYPES.in, amount },
            deposit: Number(primaryAccount.deposit) + Number(amount),
          },
          session,
        );

        const saleAmount = (amount / moveAccount.rate).toFixed(0);

        await accountService.updateAccount(
          moveAccount._id,
          {
            lastMove: { type: MOVE_TYPES.out, amount: saleAmount },
            deposit: Number(moveAccount.deposit) - Number(saleAmount),
          },
          session,
        );
      }

      if (subType === MOVE_SUBTYPES.deposit) {
        await accountService.updateAccount(
          moveAccount._id,
          {
            lastMove: { type: MOVE_TYPES.in, amount },
            deposit: Number(moveAccount.deposit) + Number(amount),
          },
          session,
        );
      }

      if (subType === MOVE_SUBTYPES.withdraw) {
        await accountService.updateAccount(
          moveAccount._id,
          {
            lastMove: { type: MOVE_TYPES.out, amount },
            deposit: Number(moveAccount.deposit) - Number(amount),
          },
          session,
        );
      }

      const accountsAfter = await accountService.getAccounts(
        user.shopId,
        session,
      );

      const history = new History({
        moveSubType: subType,
        user: move.user,
        accountsBefore: accounts,
        accountsAfter,
        shop: user.shop,
        shopId: user.shopId,
        userId: user.id,
        amount,
        isUndo: false,
      });

      await historyService.createHistory(history, session);
      await session.commitTransaction();

      return createdMove;
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction failed:", error);
      throw error("Internal server error");
    } finally {
      session.endSession();
    }
  }

  async deleteMove(moveId, user) {
    const session = await mongoose.startSession().catch((err) => {
      console.error("Error starting session:", err);
      throw error("Internal server error");
    });

    if (!session) return;

    try {
      const move = await moveRepository.findById(moveId);

      if (!move) {
        throw error("Invalid move id");
      }

      const { subType, amount, account, shop } = move;

      const accounts = await accountService.getAccounts(user.shopId);
      const primaryAccount = accounts.find(
        (acc) => acc.type === ACCOUNT_TYPES.primary,
      );
      const moveAccount = accounts.find((acc) => acc.name === account);

      if (!primaryAccount || !moveAccount) {
        throw error("error finding primaryAccount or moveAccount");
      }

      await session.startTransaction();

      await moveRepository.deleteById(moveId, session);

      if (subType === MOVE_SUBTYPES.win) {
        await accountService.updateAccount(
          moveAccount._id,
          {
            lastMove: { type: MOVE_TYPES.out, amount },
            deposit: Number(moveAccount.deposit) - Number(amount),
          },
          session,
        );

        await accountService.updateAccount(
          primaryAccount._id,
          {
            lastMove: { type: MOVE_TYPES.in, amount },
            deposit: Number(primaryAccount.deposit) + Number(amount),
          },
          session,
        );
      }

      if (subType === MOVE_SUBTYPES.spending) {
        await accountService.updateAccount(
          primaryAccount._id,
          {
            lastMove: { type: MOVE_TYPES.in, amount },
            deposit: Number(primaryAccount.deposit) + Number(amount),
          },
          session,
        );
      }

      if (subType === MOVE_SUBTYPES.sale) {
        const rate = moveAccount.rate;

        await accountService.updateAccount(
          primaryAccount._id,
          {
            lastMove: { type: MOVE_TYPES.out, amount },
            deposit: Number(primaryAccount.deposit) - Number(amount),
          },
          session,
        );

        const saleAmount = (amount / moveAccount.rate).toFixed(0);

        await accountService.updateAccount(
          moveAccount._id,
          {
            lastMove: {
              type: MOVE_TYPES.in,
              amount: (Number(amount) / Number(rate)).toFixed(0),
            },
            deposit:
              Number(moveAccount.deposit) +
              Number((Number(amount) / Number(rate)).toFixed(0)),
          },
          session,
        );
      }

      if (subType === MOVE_SUBTYPES.deposit) {
        await accountService.updateAccount(
          moveAccount._id,
          {
            lastMove: { type: MOVE_TYPES.out, amount },
            deposit: Number(moveAccount.deposit) - Number(amount),
          },
          session,
        );
      }

      if (subType === MOVE_SUBTYPES.withdraw) {
        await accountService.updateAccount(
          moveAccount._id,
          {
            lastMove: { type: MOVE_TYPES.in, amount },
            deposit: Number(moveAccount.deposit) + Number(amount),
          },
          session,
        );
      }

      const accountsAfter = await accountService.getAccounts(
        user.shopId,
        session,
      );

      const history = new History({
        moveSubType: subType,
        user: move.user,
        accountsBefore: accounts,
        accountsAfter,
        shop: user.shop,
        shopId: user.shopId,
        userId: user.id,
        amount,
        isUndo: true,
      });

      await historyService.createHistory(history, session);
      await session.commitTransaction();

      return move;
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction failed:", error);
      throw error("Internal server error");
    } finally {
      session.endSession();
    }
  }
}

module.exports = new MoveService();
