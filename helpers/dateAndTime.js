const getTodayRange = () => {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);
  return { start: startOfDay, end: endOfDay };
};

const getYesterdayRange = () => {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
  );
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);
  return { start: startOfDay, end: endOfDay };
};

const getWeekRange = () => {
  const now = new Date();
  // Calculate the start of the week (Monday)
  const dayOfWeek = now.getUTCDay(); // 0 (Sunday) to 6 (Saturday)
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Offset to get to Monday
  const startOfWeek = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + mondayOffset,
    ),
  );

  // Calculate the end of the week (next Monday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 7);

  return { start: startOfWeek, end: endOfWeek };
};

// Get the range for the current month
const getMonthRange = () => {
  const now = new Date();
  // Start of the month
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  // Start of the next month
  const startOfNextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  return { start: startOfMonth, end: startOfNextMonth };
};

module.exports = {
  getTodayRange,
  getYesterdayRange,
  getWeekRange,
  getMonthRange,
};
