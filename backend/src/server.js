import express from "express";
import {ENV} from "./lib/env.js";

const app = express();

console.log(ENV.PORT);

app.get("/health", (req, res) => {
    res.status(200).json({msg: "api is up and running"});
})

app.listen(ENV.PORT, () => console.log("server listening on port ", ENV.PORT));