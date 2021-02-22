const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const textEntry = require("./models/textEntry.model");
const schedule = require('node-schedule');
// Config dotev
require("dotenv").config({
  path: "./config/.env",
});

// config database
connectDB();

const app = express();

app.use(bodyParser.json());
// app.use(function (req, res, next) {
//   var allowedDomains = [
//     "http://localhost:3000",
//     "https://copybin-5de5c.web.app",
//   ];
//   var origin = req.headers.origin;
//   res.setHeader("Access-Control-Allow-Origin", origin);
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "X-Requested-With,content-type, Accept"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", true);

//   // if (allowedDomains.indexOf(origin) > -1) {
//   //   res.setHeader("Access-Control-Allow-Origin", origin);
//   // }

//   // res.setHeader(
//   //   "Access-Control-Allow-Methods",
//   //   "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   // );
//   // res.setHeader(
//   //   "Access-Control-Allow-Headers",
//   //   "X-Requested-With,content-type, Accept"
//   // );
//   // res.setHeader("Access-Control-Allow-Credentials", true);

//   next();
// });
const publicRouter = require("./routes/public.routes");

// Dev Loggin Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

  // app.use(
  //   cors({
  //     origin: process.env.CU,
  //   })
  // );
var allowedDomains = [process.env.CLIENT_URL, "http://localhost:3000"];
app.use(
  cors({
    origin: function (origin, callback) {
      // bypass the requests with no origin (like curl requests, mobile apps, etc )
      if (!origin) return callback(null, true);

      if (allowedDomains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
app.use("/api", publicRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    msg: "Page not founded",
  });
});




const job = schedule.scheduleJob('*/1 * * * *', function(fireDate){
  console.log('running scheduled deletion task...');
  let timeObject = new Date();
  textEntry.deleteMany({ expiry: { $lt: timeObject } },(err,docs)=>{
    // console.log(docs);
    console.log(err);
  });

});
const PORT = process.env.PORT||5000;
app.listen(PORT, () => {
    job.schedule();
    console.log(`auth server listening on port`+PORT);
});
