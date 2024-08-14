import { addVideo, createChannel } from "./lib/db.js";
import { lstat, mkdir, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { globby } from "globby";

const linkNameRegex = /@.*(\/)?/gm;

const createDirectoryIfNotExists = async (dir) => {
  try {
    const stats = await lstat(dir);
    if (!stats.isDirectory()) {
      await mkdir(dir);
    }
  } catch (error) {
    await mkdir(dir);
  }
};

const downloadContent = async (args) => {
  return new Promise((resolve, reject) => {
    const downloadProcess = spawn("./scripts/yt-dlp.exe", args);
    downloadProcess.stderr.on("data", (data) => {
      console.log(data.toString("utf-8"));
    });
    downloadProcess.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
};

export const registerChannelMeta = async (channelName) => {
  const getChannelMetaFilename = (channelName) =>
    globby(`./content/metadata/${channelName}/* - Videos*`).then(
      (files) => files[0]
    );
  const metaFilename = await getChannelMetaFilename(channelName);
  const metafileContent = await readFile(metaFilename, "utf-8");
  const meta = JSON.parse(metafileContent);

  return await createChannel(meta.channel, metaFilename);
};

export const registerVideosMeta = async (channelName, channelID) => {
  const getVideoMetaFilename = async (filename, channel) => {
    return await globby(`./content/metadata/${channel}/*${filename}*`)[0];
  };

  const videoFiles = await globby(`./content/videos/${channelName}`);
  
  for (const filename of videoFiles) {
    const youtubeID = filename
      .match(/\[(.*)\]/g)
      .at(-1)
      .slice(1);
    console.log(youtubeID);
    
    const videoMetaFilename = await getVideoMetaFilename(youtubeID, channelName);
    const videoMetaContent = await readFile(videoMetaFilename, "utf-8");
    const videoMeta = JSON.parse(videoMetaContent);

    return await addVideo(videoMeta.title, filename, channelID, videoMetaFilename);
  }
};
export const registerAllChannel = async (channelName) => {
  const channelID = await registerChannelMeta(channelName);
  const videoID = await registerVideosMeta(channelName, channelID);
  console.log("[DOWNLOADER] Added Video to db: id = ", videoID);
};

export const downloadChannelMeta = async (link) => {
  const channelName = link.match(linkNameRegex)[0];
  const metaDir = `/content/metadata/${channelName}`;
  try {
    await createDirectoryIfNotExists(metaDir);
    await downloadContent([
      "-w",
      "-P",
      metaDir,
      "--write-info-json",
      "--skip-download",
      "--flat-playlist",
      link,
    ]);
  } catch (error) {
    console.log("Downloading error.", error);
  }
}

export const downloadChannel = async (link) => {
  const channelName = link.match(linkNameRegex)[0];
  const metaDir = `./content/metadata/${channelName}`;
  const videosDir = `./content/videos/${channelName}`;


  try {
    await createDirectoryIfNotExists(metaDir);
    await createDirectoryIfNotExists(videosDir);

    await downloadContent([
      "-w",
      "-P",
      metaDir,
      "--write-info-json",
      "--skip-download",
      link,
    ]);

    await downloadContent([
      "-w",
      "-S",
      "res:1080,abr,+size",
      "-N",
      "6",
      "-P",
      videosDir,
      "--downloader",
      "aria2c",
      link,
    ]);

    await registerAllChannel(channelName);
  } catch (error) {
    console.log("Downloading error.", error);
  }
};

export const downloadPlaylist = async (link) => {
  
}