require("dotenv").config();
require("express-async-errors");

const bodyParser = require("body-parser");
const connectDB = require("./db/connect");
const passport = require("passport");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const forceHttpsMiddleware = require("./middleware/force-https");

const bikesRouter = require("./routes/bikes");
const usersRouter = require("./routes/users");
const stationsRouter = require("./routes/stations");

const express = require("express");
const app = express();

//MUST declare body parser  BEFORE routes
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(express.static("./public"));
app.use(passport.initialize());

//force https in production
if (process.env.NODE_ENV !== "devel") {
  app.use(forceHttpsMiddleware);
}

//Routes
app.use("/api/v1/bikes", bikesRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/stations", stationsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

//Start server
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    // connectDB
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
