import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

/**
 * Creates a new channel if it doesn't already exist.
 * @param {string} name - The name of the channel.
 * @param {string} metaFilename - The metadata filename associated with the channel.
 * @returns {Promise<number>} The ID of the existing or newly created channel.
 */
export async function createChannel(name, metaFilename) {
  const channel = await client.channel.findFirst({
    where: {
      metaFilename,
    },
  });
  return channel ? channel.id : (await client.channel.create({ data: { name, metaFilename } })).id;
}

/**
 * Adds a new video if it doesn't already exist.
 * @param {string} title - The title of the video.
 * @param {string} filename - The filename of the video.
 * @param {number} channelId - The ID of the channel to which the video belongs.
 * @param {string} metaFilename - The metadata filename associated with the video.
 * @returns {Promise<number>} The ID of the existing or newly created video.
 */
export async function addVideo(title, filename, channelId, metaFilename) {
  const video = await client.video.findFirst({
    where: {
      filename,
    },
  });
  return video ? video.id : (await client.video.create({ data: { title, filename, metaFilename, channelId } })).id;
}

export async function getChannel(username, title) {
  const channel = await client.channel.findFirst({
    where: {
      username
    }
  });
  return channel ? channel.id : (await client.channel.create({ data: { title, username } })).id;
}