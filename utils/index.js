const Bike = require("../db/models/Bike");
const User = require("../db/models/User");
const configs = require("./configs");

module.exports = {};
/**
 *
 * @param {*} Model to search (User, Bike)
 * @param {*} field to search (user.otp)
 * @returns a 6 digits string, unique within the Model.field
 */
getSixDigitsCode = async function (Model, field, expiresAfter = null) {
  let codeInUse, code;
  do {
    code = Math.floor(Math.random() * 10 ** 6);
    code = code.toString().padStart(6, "0");
    codeInUse = await Model.findOne({ [field]: code });
  } while (codeInUse);

  return code;
};

module.exports.getOtp = () => getSixDigitsCode(User, "otp");
module.exports.getFamilyCode = () => getSixDigitsCode(User, "familyCode");
module.exports.getNewBikeCode = () => getSixDigitsCode(Bike, "code");
module.exports.configs = configs;
