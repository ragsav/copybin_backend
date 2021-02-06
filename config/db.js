const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// dotenv.config();
const connectDB = async () => {
  const connection = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  console.log(`MongoDB Connected: ${connection.connection.host}`);
};

module.exports = connectDB;
