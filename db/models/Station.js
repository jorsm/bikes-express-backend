const { required, number } = require("joi");
const mongoose = require("mongoose");

const StationSchema = new mongoose.Schema(
  {
    bikes: [
      {
        type: String,
        required: [true, "must provide bike ID"],
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        //[Longitude, Latitude]
        type: [Number],
        required: true,
      },
    },
    // max # of bikes parked at the same time
    capacity: {
      type: Number,
      default: 100,
      min: 1,
    },
    // meters from 'location' in wich ending rent is allowed
    radius: {
      type: Number,
      default: 5,
      min: 1,
    },
  },
  { timestamps: true }
);

StationSchema.index({ location: "2dsphere" });

StationSchema.virtual("isFull").get(function () {
  return this.capacity - endStation.this.length > 0 ? false : true;
});

StationSchema.methods.startRent = async function (bikeCode) {
  try {
    this.bikes = this.bikes.filter((_bikeCode) => _bikeCode != bikeCode);
    this.save();
  } catch (error) {
    throw error;
  }
};
StationSchema.methods.endRent = async function (bikeCode) {
  try {
    if (!this.bikes.includes(bikeCode)) this.bikes.push(bikeCode);
    this.save();
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("Station", StationSchema);
