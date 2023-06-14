import { getLinkPreview } from "link-preview-js";
import { cache } from "react";

import { Metadata } from "./link-preview-types";

export const fetchLinkMeta = cache(async (url: string) => {
  const startTime = Date.now();
  console.info("fetching " + url);
  const data = await getLinkPreview(Array.isArray(url) ? url[0] : url, {
    timeout: 6000,
    headers: {
      "user-agent": "googlebot",
    },
    followRedirects: "follow",
  });
  console.info("fetched " + url + " in " + (Date.now() - startTime) + "ms");
  return data as Metadata;
});
