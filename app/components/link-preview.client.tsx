"use client";

/* eslint-disable @next/next/no-img-element */
import useSWR from "swr/immutable";
import * as React from "react";
import { useInView } from "react-intersection-observer";
import { toLinkPreviewCardMeta } from "../lib/adopt-link-preview-meta";
import { PreviewCard } from "./preview-card";

const normalizeUrl = (url: string) => {
  if (url.startsWith("/")) {
    return new URL(url, document.location.origin).href;
  }
  return url;
};

const fetcher = (url: string) => {
  if (!url) {
    return Promise.resolve(null);
  }
  return fetch(
    `/api/link-preview?url=${encodeURIComponent(normalizeUrl(url))}`
  ).then((res) => {
    if (res.status >= 400) {
      throw res.statusText;
    }
    return res.json();
  });
};

const useLinkPreview = (href: string, visible: boolean) => {
  const { data, error } = useSWR(visible ? href : "", fetcher);

  return React.useMemo(() => {
    return toLinkPreviewCardMeta({
      url: href,
      contentType: "placeholder",
      ...data,
      error,
    });
  }, [href, data, error]);
};

export default function LinkPreviewClient({ url }: { url: string }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const meta = useLinkPreview(url, inView);
  return <PreviewCard ref={ref} data={meta} />;
}
