const bcrypt = require("bcryptjs");

const hashPassword = async (password, seed = 10) => {
  try {
    const salt = await bcrypt.genSalt(seed);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (err) {
    throw error(err);
  }
};

const comparePasswords = async (password, savedPassword) => {
  return bcrypt.compare(password, savedPassword);
};

module.exports = { hashPassword, comparePasswords };
