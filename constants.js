const MOVE_SUBTYPES = {
  sale: "vente",
  win: "gain",
  spending: "dépense",
  deposit: "versement",
  withdraw: "retrait",
};

const MOVE_TYPES = {
  in: "entrée",
  out: "sortie",
};

const PERIOD_VALUES = {
  daily: "daily",
  yesterday: "yesterday",
  weekly: "weekly",
  monthly: "monthly",
};

const ACCOUNT_TYPES = {
  primary: "primary",
  secondary: "secondary",
};

module.exports = { MOVE_SUBTYPES, MOVE_TYPES, PERIOD_VALUES, ACCOUNT_TYPES };
