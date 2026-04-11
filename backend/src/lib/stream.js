import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const secretKey = ENV.STREAM_API_SECRET;

if (!apiKey || !secretKey) {
  console.error("STREAM_API_KEY or STREAM_API_SECRET is missing");
}

export const chatClient = StreamChat.getInstance(apiKey, secretKey);

export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser(userData);
    console.log("stream user upserted successfully:", userData);
  } catch (error) {
    console.log("error upserting the stream user:", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log("stream user deleted successfully:", userId);
  } catch (error) {
    console.log("error deleting the stream user:", error);
  }
};

// todo: add another method to generateToken
