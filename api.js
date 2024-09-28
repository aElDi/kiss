import e from "express";
import cp from "node:child_process"
import { testVideoID } from "./utils/youtube.js";
import { findVideo } from "./lib/db.js";
export const apiRouter = e.Router();

apiRouter.post("/download", (req, res) => {
  if (!req.body.url) return res.status(400).send("Arguments error");
  const child = cp.fork("downloader.js", [req.body.url]);
  child.on("error", (err) => {
    res.status(500).send(err.toString("utf-8"));
  });
  child.on("close", (code) => {
    if (code === 0) {
      res.send("OK");
    }
  });
});

apiRouter.get("/video/:id", async (req, res) => {
  console.log("Request to get video:", req.params.id)
  if(!testVideoID(req.params.id)) return res.status(400).send("Bad ID parameter");
  const video = await findVideo(req.params.id);
  if (!video) return res.status(404).send("Video doesnt exist");
  return res.status(200).type("application/json").send(video);
})