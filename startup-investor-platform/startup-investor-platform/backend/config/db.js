const mongoose = require('mongoose');
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startup_platform');
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};
module.exports = connectDB;
