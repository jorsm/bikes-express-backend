const { model } = require("mongoose");
const Bike = require("../db/models/Bike");
const User = require("../db/models/User");
const { BadRequestError, PaymentRequiredError } = require("../errors");
const configs = require("./configs");

module.exports = {};
module.exports.configs = configs;
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
  if (expiresAfter)
    setTimeout(() => {
      Model.findOne({ [field]: code }).then((modelInstance) => {
        modelInstance.set(field, null);
      });
    }, expiresAfter);

  return code;
};
/**
 * create a unique code that expires after configs.AUTH_OTP_LIFETIME
 *
 * @returns 6 digits string
 */
module.exports.getOtp = () =>
  getSixDigitsCode(User, "otp", configs.AUTH_OTP_LIFETIME);
module.exports.getFamilyCode = () => getSixDigitsCode(User, "familyCode");
module.exports.getNewBikeCode = () => getSixDigitsCode(Bike, "code");
/**
 * check if user has a valid subscription (either free trial or payed sub)
 *
 * @param {*} userId
 * @returns "free_trial" | subscriptionID | false
 * @throws UnauthorizedError if user is not found
 * @throws PaymentRequiredError if user did not return the bike in time and did not pay the relative fine yet
 */
module.exports.checkValidSubscription = async (userId) => {
  let subscription = false;
  let user = await User.findById(userId);
  if (!user) throw new UnauthorizedError("user not found");
  if (user.free_trial) subscription = "free_trial";
  else {
    let userSubscription = await Subscription.findOne({
      user: req.user.id,
      endsAt: { $gte: new Date() },
    });
    if (userSubscription) {
      if (userSubscription.suspended)
        throw new PaymentRequiredError("suscription is temporarily suspended");
      else subscription = userSubscription?.id;
    }
  }
  return subscription;
};
