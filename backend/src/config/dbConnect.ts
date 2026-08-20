import mongoose from "mongoose";
import ENV from "./env";

const dbConnect = async () => {
  try {
    await mongoose.connect(ENV.mongo_uri);
    console.log("🚀 DB connected successfully");
  } catch (error: any) {
    console.error("Failed to connect to DB, ERROR: ", error.message);
  }
};

export default dbConnect;
