const allowedTags = /<(?!\/?(?:p|br|strong|b|em|i|h1|h2|h3|ul|ol|li|blockquote)\b)[^>]*>/gi;

export function cleanSopHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\sstyle=("[^"]*"|'[^']*')/gi, "")
    .replace(allowedTags, "")
    .replace(/<([a-z0-9]+)(?:\s[^>]*)?>\s*<\/\1>/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validVideoUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["youtube.com", "www.youtube.com", "youtu.be", "vimeo.com", "www.vimeo.com"].includes(url.hostname) ? value : null;
  } catch {
    return null;
  }
}

export function videoEmbedUrl(value: string | null) {
  if (!value || !validVideoUrl(value)) return null;
  const url = new URL(value);
  if (url.hostname === "youtu.be") return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
  if (url.hostname === "youtube.com" || url.hostname === "www.youtube.com") {
    const videoId = url.searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  return `https://player.vimeo.com/video/${url.pathname.split("/").filter(Boolean).pop()}`;
}
