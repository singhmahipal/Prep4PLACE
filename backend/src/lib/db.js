import mongoose from "mongoose";

import { ENV } from "./env.js";
import e from "express";

export const connectDB = async () => {
  if (!ENV.DB_URL) {
    throw new Error("Missing required env var: DB_URL");
  }

  try {
    const conn = await mongoose.connect(ENV.DB_URL);
    console.log("Connected to MongoDB:", conn.connection.host);
  } catch (error) {
    throw new Error("Error connecting to MongoDB", { cause: error });
  }
};
