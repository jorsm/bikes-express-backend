const mongoose = require("mongoose");
//const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_LIFETIME } = require("../../utils/configs");

//const privateKey = fs.readFileSync("private.key");

const UserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, "Please provide phone number"],
      unique: true,
      match: [/^\+[1-9]{1}[0-9]{3,14}$/, "a valid phone number is required"],
    },
    familyCode: { type: String, length: 6 },
    otp: { type: String, length: 6, default: null },
    phone_verified: { type: Boolean, default: false },
    free_trial: { type: Boolean, default: true },
  },
  { timestamps: true }
);

//name and user are name in conbination
// i can have 20 Franco user and 10 users associated with the number 3456677890
// but only one Franco with the number  3456677890
//UserSchema.index({ phone: 1 }, { unique: true });

UserSchema.virtual("jwtToken").get(function () {
  return jwt.sign(
    { id: this._id, name: this.name, familyCode: this.familyCode },
    process.env.USER_JWT_SECRET,
    {
      expiresIn: JWT_LIFETIME,
    }
  );
});
UserSchema.methods.sendOtpSMS = async function (message, otp) {
  try {
    message = message + otp;
    this.otp = otp;
    this.save();
    console.log("set OTP for user: " + otp);
  } catch (error) {
    throw error;
  }
};

UserSchema.methods.otpVerified = async function () {
  try {
    this.otp = null;
    this.phone_verified = true;
    this.save();
  } catch (error) {
    throw error;
  }
};

/*
UserSchema.methods.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  bcrypt.hash(password, salt).then((hashedPassword) => {
    this.set("password", hashedPassword);
    this.save();
  });
};

UserSchema.methods.comparePassword = async function (canditatePassword) {
  hashedPassword = this.password;
  return await bcrypt.compare(canditatePassword, hashedPassword);
};

*/

module.exports = mongoose.model("User", UserSchema);
