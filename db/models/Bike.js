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
          "repaired", //Bike ready but not available yet for rent
          "broken", //Bike flaged to repair
          "repairing", //Bike picked up to repair
          "locked", //Bike on active rent and locked
          "rented", //Bike on active rent and unlocked
          "available", //Bike available for rent
        ],
        message: "{VALUE} is not supported",
      },
      default: "repaired",
    },
    conditions: { type: Number, min: 1, max: 5, default: 4.5 },
  },
  { timestamps: true }
);

BikeSchema.methods.startRent = function () {
  this.status = "rented";
  this.save();
};
BikeSchema.methods.endRent = async function () {
  this.status = this.conditions > 2.5 ? "available" : "broken";
  this.save();
};

module.exports = mongoose.model("Bike", BikeSchema);
