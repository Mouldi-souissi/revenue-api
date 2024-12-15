const mongoose = require("mongoose");
require("dotenv").config();

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      mongoose.set("strictQuery", true);
      this.connection = await mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("DB is connected");
    } catch (err) {
      console.error("Failed to connect to the database:", err.message);
      throw err;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        console.log("DB is disconnected");
        this.connection = null;
      } else {
        console.warn("No active database connection to disconnect");
      }
    } catch (err) {
      console.error("Failed to disconnect from the database:", err.message);
      throw err;
    }
  }

  async transaction(callback) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await callback(session); // Execute callback with the session
      await session.commitTransaction(); // Commit the transaction
      console.log("Transaction committed successfully");
      return result;
    } catch (err) {
      await session.abortTransaction(); // Rollback changes
      console.error("Transaction aborted:", err.message);
      throw err;
    } finally {
      session.endSession(); // End the session
    }
  }

  // Other CRUD methods...
  async create(model, data) {
    try {
      const result = await model.create(data);
      return result;
    } catch (err) {
      console.error("Failed to create document:", err.message);
      throw err;
    }
  }

  async read(model, query = {}, options = {}) {
    try {
      const result = await model.find(query, null, options).exec();
      return result;
    } catch (err) {
      console.error("Failed to read documents:", err.message);
      throw err;
    }
  }

  async update(model, query, updateData, options = { new: true }) {
    try {
      const result = await model
        .findOneAndUpdate(query, updateData, options)
        .exec();
      return result;
    } catch (err) {
      console.error("Failed to update document:", err.message);
      throw err;
    }
  }

  async delete(model, query) {
    try {
      const result = await model.findOneAndDelete(query).exec();
      return result;
    } catch (err) {
      console.error("Failed to delete document:", err.message);
      throw err;
    }
  }
}

module.exports = new Database();
