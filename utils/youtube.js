
export const VIDEO_URL_REGEX = /youtu(?:.*\/v\/|.*v\=|\.be\/)([A-Za-z0-9_\-]{11})/gm;
export const VIDEO_ID_REGEX = /^[A-Za-z0-9_\-]{11}$/gm;

export const testVideoURL = (url) => VIDEO_URL_REGEX.test(url);
export const testVideoID = (id) => VIDEO_ID_REGEX.test(id);