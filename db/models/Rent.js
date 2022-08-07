const { required } = require("joi");
const mongoose = require("mongoose");
const { BadRequestError } = require("../../errors");
const errorHandlerMiddleware = require("../../middleware/error-handler");
const Bike = require("./Bike");
const Station = require("./Station");

const RentSchema = new mongoose.Schema(
  {
    bikeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bike",
      required: [true, "must provide bike ID"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "must provide user ID"],
    },
    startStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: [true, "must start station ID"],
    },
    endStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
    },
  },
  { timestamps: true }
);

RentSchema.methods.start = async function (bikeId, userId, startStationId) {
  //ToDo: check if bike is present in station
  //ToDo: unpark bike
  //mongoose translates findById(undefined) into findOne({ _id: null })
  //!! findOne({ _id: undefined }) are equivalent to findOne({}) and return arbitrary documents!!
  /*
  self = this;
  await Bike.findById(bikeId,callback = (err, bike)=>{
      if(err) return err
      if (!bike || bike.status != "avaiable") return new BadRequestError('bike not avaiable for rent')
  });
  await User.findById(userId,callback = (err, user)=>{
    if(err) return err
    if (!user) return new BadRequestError('user not found')
    //ToDo: check valid payment status and if first_rent
});
await Station.findByOne({bikes: bikeId},callback = (err, station)=>{
  //ToDo: i could directly send the station Id in the request...
  if(err) return err
  if (!station) return new BadRequestError('station not avaiable')
  station.unpark(bikeId);
});


this.userId = userId;
this.startStationId = startStationId;
self.save();
*/
  let checkBike = Bike.findById(bikeId).exec();
  let checkUser = User.findById(userId).exec();
  let checkStation = Station.findByid(startStationId).exec();

  Promise.all([checkBike, checkUser, checkStation]).then((...results) => {
    if (!results.bike || results.bike.status != "avaiable")
      throw new BadRequestError("bike not avaiable for rent");
  });
};

RentSchema.methods.end = async function (endStationId) {
  stationFull = station.capacity - station.bikes.size > 0 ? true : false;
  await Station.findById();
  this.endStationId = endStationId;
  this.save();
};
module.exports = mongoose.model("Rent", RentSchema);
