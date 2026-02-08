require('dotenv').config();

const database = require('../db/database');
const shopRepo = require('../repositories/shopRepository');
const userRepo = require('../repositories/userRepository');
const accountRepo = require('../repositories/accountRepository');
const { hashPassword } = require('../helpers/encryption');
const { ACCOUNT_TYPES, USER_ROLES } = require('../constants');

async function main() {
  try {
    await database.connect(process.env.DB);

    // create or fetch shop
    const shopName = 'aouina';
    let shop;
    try {
      shop = await shopRepo.create({ name: shopName, address: shopName });
      console.log('Shop created:', shop._id.toString());
    } catch (err) {
      if (err && err.code === 11000) {
        console.log('Shop already exists, fetching existing one');
        const Shop = require('../models/Shop');
        shop = await database.readOne(Shop, { name: shopName });
      } else {
        throw err;
      }
    }

    // create admin user if not exists
    const adminEmail = 'admin@aouina.com';
    let admin = await userRepo.findByEmail(adminEmail);
    if (!admin) {
      const hashed = await hashPassword('adminpass');
      admin = await userRepo.create({
        name: 'Admin',
        email: adminEmail,
        password: hashed,
        type: USER_ROLES.ADMIN,
        shop: shop.name,
        shopId: shop._id,
      });
      console.log('Admin user created:', admin._id.toString());
    } else {
      console.log('Admin user already exists:', admin._id.toString());
    }

    // create primary and secondary accounts if not exists
    const accountsToCreate = [
      { name: 'Primary Account', deposit: 1000, type: ACCOUNT_TYPES.primary },
      { name: 'Secondary Account', deposit: 500, type: ACCOUNT_TYPES.secondary },
    ];

    const existingAccounts = await accountRepo.findByShopId(shop._id);

    for (const acc of accountsToCreate) {
      const exists = existingAccounts.find((a) => a.type === acc.type);
      if (exists) {
        console.log(`${acc.type} account already exists: ${exists._id}`);
        continue;
      }

      const created = await accountRepo.create({
        name: acc.name,
        deposit: acc.deposit,
        type: acc.type,
        shop: shop.name,
        shopId: shop._id,
      });
      console.log(`${acc.type} account created: ${created._id}`);
    }

    await database.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    try {
      await database.disconnect();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

main();
