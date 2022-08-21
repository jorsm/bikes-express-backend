const mongoose = require("mongoose");

const BikeSchema = new mongoose.Schema(
  {
    code: {
      type: Number,
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
      default: "avaiable", //ToDo change to repaired
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
  const flagToRepair = this.conditions > 2.5 ? "available" : "broken";
  this.status.set(flagToRepair);
};

module.exports = mongoose.model("Bike", BikeSchema);
