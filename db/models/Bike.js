const { MULTI_STATUS } = require("http-status-codes");
const mongoose = require("mongoose");

const BikeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "must provide name"],
      trim: true,
      maxlength: [20, "name can not be more than 20 characters"],
      minlength: [5, "name can not be less than 5 characters"],
    },
    status: {
      type: String,
      enum: {
        values: [
          "repaired", //Bike ready but not avaiable yet for rent
          "broken", //Bike flaged to repair
          "repairing", //Bike picked up to repair
          "locked", //Bike on active rent and locked
          "rented", //Bike on active rent and unlocked
          "avaiable", //Bike avaiable for rent
        ],
        message: "{VALUE} is not supported",
      },
      default: "repaired",
    },
    conditions: { type: Number, min: 1, max: 5, default: 4.5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bike", BikeSchema);
