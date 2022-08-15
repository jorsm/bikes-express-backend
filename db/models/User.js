const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../../errors");
const { JWT_LIFETIME } = require("../../utils/configs");
//const privateKey = fs.readFileSync("private.key");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,

      maxlength: 50,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
    },
    password: {
      type: String,
    },
    verifiedEmail: { type: Boolean, default: false },
    google_id: Number,
    facebook_id: Number,
  },
  { timestamps: true }
);

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

UserSchema.methods.createJWT = function () {
  //ToDo: Use RSA?? need private key file
  //return jwt.sign({ userId: this._id }, privateKey, { algorithm: 'RS256', expiresIn: process.env.JWT_LIFETIME,});
  return jwt.sign({ id: this._id }, process.env.USER_JWT_SECRET, {
    expiresIn: JWT_LIFETIME,
  });
};

UserSchema.methods.sendSignUpEmail = async function () {
  console.log("sendSignUpEmail(): Not Implemented yet");
};
UserSchema.methods.confirmEMail = function () {
  console.log("confirmEMail(): Not Implemented yet");
};

module.exports = mongoose.model("User", UserSchema);
