const getTodayRange = () => {
  const now = new Date().toLocaleString("en-TN", { timeZone: "Africa/Tunis" });
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(startOfDay.getDate() + 1);

  return { start: startOfDay, end: endOfDay };
};

const getYesterdayRange = () => {
  const now = new Date().toLocaleString("en-TN", { timeZone: "Africa/Tunis" });
  const startOfDay = new Date(now);
  startOfDay.setDate(startOfDay.getDate() - 1);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(startOfDay.getDate() + 1);

  return { start: startOfDay, end: endOfDay };
};

const getWeekRange = () => {
  const now = new Date().toLocaleString("en-TN", { timeZone: "Africa/Tunis" });
  const dayOfWeek = new Date(now).getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return { start: startOfWeek, end: endOfWeek };
};

const getMonthRange = () => {
  const now = new Date().toLocaleString("en-TN", { timeZone: "Africa/Tunis" });
  const startOfMonth = new Date(now);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfNextMonth = new Date(startOfMonth);
  startOfNextMonth.setMonth(startOfMonth.getMonth() + 1);
  startOfNextMonth.setDate(1);

  return { start: startOfMonth, end: startOfNextMonth };
};

module.exports = {
  getTodayRange,
  getYesterdayRange,
  getWeekRange,
  getMonthRange,
};
