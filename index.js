import express from "express";
import cp from "node:child_process"

const app = express();

app.use(express.json());

app.post("/api/download", (req, res) => {
  if(!req.body.url) return res.status(400).send("Arguments error");
  const child = cp.fork("downloader.js", [req.body.url]);
  child.on("error", (err) => {
    res.status(500).send(err.toString('utf-8'));
  })
  child.on("close", (code) => {
    if (code === 0){
      res.send("Downloaded");
    }
  })
});

app.listen(8081, () => {
  console.log("Server was started.");
})