import express from "express";
import { apiRouter } from "./api.js";

const app = express();

app.use(express.json());

app.use('/api', apiRouter)

app.listen(8081, () => {
  console.log("Server was started.");
})