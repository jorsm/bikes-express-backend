//middleware to force HTTPS
const forceHttps = (req, res, next) => {
  if (req.header("x-forwarded-proto") !== "https") {
    res.redirect(`https://${req.header("host")}${req.url}`);
  } else {
    next();
  }
};

module.exports = forceHttps;
