import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

const app = express();

const __dirname = path.resolve();

// middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true })); // CREDENTIALS True means server allows browsers to include cookies on request

app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

app.get("/book", (req, res) => {
  res.status(200).json({ msg: "book end point" });
});

// Serve React frontend
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  // catch all unmatched routes
  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(ENV.PORT, () =>
      console.log("server listening on port ", ENV.PORT),
    );
    server.on("error", (error) => {
      console.error("error starting the server:", error);
      process.exit(1);
    });
  } catch (error) {
    console.log("error starting the server:", error);
    console.error("startup failed:", error);
    process.exit(1);
  }
};

startServer();
