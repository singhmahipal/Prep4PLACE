import { Inngest } from "inngest";
import mongoose from "mongoose";
import { connectDB } from "./db.js";
import User from "../models/User.js";


// create a client to send and receive events
export const inngest = new Inngest({ id: "prep4place" });

// Reuse existing connection in serverless
const connectIfNeeded = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
};
const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectIfNeeded();

    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      profileImage: image_url,
    };

    await User.create(newUser);

    // todo: do something else
  },
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectIfNeeded();

    const { id } = event.data;

    await User.deleteOne({ clerkId: id });

    // todo: do something else
  },
);

export const functions = [syncUser, deleteUserFromDB];
