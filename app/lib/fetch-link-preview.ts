import { getLinkPreview } from "link-preview-js";
import { cache } from "react";

export const fetchLinkPreview = cache(async (url: string) => {
  console.info("fetching " + url);
  const data = await getLinkPreview(Array.isArray(url) ? url[0] : url, {
    timeout: process.env.NODE_ENV === "development" ? 6000 : 1000,
    headers: {
      "user-agent": "googlebot",
    },
    followRedirects: "follow",
  });
  return data;
});
