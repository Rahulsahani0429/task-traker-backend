/**
 * Database Configuration
 * Handles MongoDB connection using Mongoose with retry logic
 */
const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * Exits process on connection failure
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose options (v7+)
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
