const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = require("../middleware/error-handler");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../errors");

const User = require("../db/models/User");
const { getFamilyCode, getOtp } = require("../utils");

module.exports = {};

module.exports.signIn = async (req, res) => {
  /**
   * ToDO:  user input check
   * ToDO: delete accounts that do not verify phone number within 5 minutes
   */
  const { name, phone } = req.body;
  let message = "Use this code to  sign in:  ";
  let user = await User.findOne({ name, phone }); //check  if user is already registerd
  if (!user) {
    //new user
    user = await User.create({ name, phone });
    res.status(StatusCodes.CREATED);
    message = "Use this code to  verify your number:  ";
    familyCode = await getFamilyCode();
    user.set("familyCode", familyCode);
  }

  if (user) {
    //found or created
  } else {
    throw new Error(
      "an error occourred during the account creation, try again later"
    );
  }

  const otp = await getOtp();
  user.sendOtpSMS(message, otp);

  res.end();
};
