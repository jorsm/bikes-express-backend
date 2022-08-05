const mongoose = require("mongoose");

const connectDB = (url) => {
  return mongoose.connect(url);
};
/**
  mongoose.connection.on('error', err => {
  logError(err);
});
 */
module.exports = connectDB;
