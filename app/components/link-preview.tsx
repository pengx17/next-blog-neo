/* eslint-disable @next/next/no-img-element */import * as React from "react";
import { fetchLinkMeta } from "../lib/fetch-link-meta";
import { toLinkPreviewCardMeta } from "../lib/adopt-link-preview-meta";
import { PreviewCard } from "./preview-card";

const getLinkPreview = React.cache(async (href?: string) => {
  if (!href) {
    return toLinkPreviewCardMeta();
  }
  try {
    const data = await fetchLinkMeta(href);
    return toLinkPreviewCardMeta(data);
  } catch (err) {
    return toLinkPreviewCardMeta({
      url: href,
      error: err,
      contentType: "placeholder",
    });
  }
});

export default function LinkPreview({ url }: { url?: string }) {
  const meta = React.use(getLinkPreview(url));
  return <PreviewCard data={meta} />;
}
