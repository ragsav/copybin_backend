const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const textEntry = require("./models/textEntry.model");
const schedule = require('node-schedule');
// Config dotev
require("dotenv").config({
  path: "./config/config.env",
});

// config database
connectDB();

const app = express();

app.use(bodyParser.json());

const publicRouter = require("./routes/public.routes");

// Dev Loggin Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
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
