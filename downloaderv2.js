import { globby } from "globby";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";

const download = async (link) => {
  return new Promise((resolve, reject) => {
    const downloadProcess = spawn("./scripts/yt-dlp.exe", [
      "-P",
      "./content", // Content folder
      "-o",
      "infojson:metadata/%(uploader_id)s/%(title)s [%(id)s].%(ext)s", // Metadata in meta dirs
      "-o",
      "thumbnail:thumbnails/%(uploader_id)s/%(title)s [%(id)s].%(ext)s", // Thumbnails in other dir
      "-o",
      "videos/%(uploader_id)s/%(title)s [%(id)s].%(ext)s", // Videos in video dir
      "--write-info-json", // Download json metadata
      "--write-thumbnail", // Download thumbnails
      "--downloader",
      "aria2c", // Set downloader aria2c
      "-N",
      "4", // 4 threads
      "-w", // Do not overwrite
      "-q",
      "--no-simulate",
      "--print",
      "%(id)s", // Print to stdout videos youtube ids
      "-S",
      "res:720,abr,+size", // Sort to download smallest 720p videos
      link,
    ]);
    let newVideosIDS = []; // Array to return
    downloadProcess.stdout.on("data", (data) => {
        if (data.length === 12){ // If `data` id youtube id
            newVideosIDS.push(data.toString("utf-8").slice(0, -1)); // Add new ID
        }

    });
    downloadProcess.on("exit", (code) => {
      if (code === 0) {
        resolve(newVideosIDS); // Add
      } else {
        reject(code);
      }
    });
  });
};

export const downloadContent = async (link) => {
  const newIDS = await download(link);
  for (const id in newIDS) {
      const videoFile = await globby(`./content/videos/**/*${id}*`)[0];
      const metaFile = await globby(`./content/metadata/**/*${id}*`)[0];
      const thumbnailFile = await globby(`./content/thumbnails/**/*${id}*`)[0];

      const meta = JSON.parse(await readFile(metaFile, "utf-8"));

      
  }
};
