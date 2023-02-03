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
  return fetch(
    `/api/link-preview?url=${encodeURIComponent(normalizeUrl(url))}`
  ).then((res) => {
    if (res.status >= 400) {
      throw res.statusText;
    }
    return res.json();
  });
};

const useLinkPreview = (href: string) => {
  const { data, error } = useSWR(href, fetcher);

  return React.useMemo(() => {
    return toLinkPreviewCardMeta({
      url: href,
      ...data,
      error,
    });
  }, [href, data, error]);
};

export default function LinkPreviewClient({ url }: { url: string }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const meta = useLinkPreview(inView ? url : "");
  return <PreviewCard ref={ref} data={meta} />;
}
