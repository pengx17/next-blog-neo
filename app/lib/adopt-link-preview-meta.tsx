import type {
  Metadata,
  HTMLResponse,
  VideoResponse,
  AudioResponse,
  ImageResponse,
  LinkPreviewMeta,
  LinkPreviewCardData,
} from "./link-preview-types";

const isHTML = (d: Metadata): d is HTMLResponse => {
  return (d as any).contentType.startsWith("text/html");
};

const isVideo = (d: Metadata): d is VideoResponse => {
  return (d as any).contentType.startsWith("video/");
};

const isAudio = (d: Metadata): d is AudioResponse => {
  return (d as any).contentType.startsWith("audio/");
};

const isImage = (d: Metadata): d is ImageResponse => {
  return (d as any).contentType.startsWith("image/");
};

const getCardSize = (data: LinkPreviewMeta) => {
  // If link has cover image
  let width =
    data.images && data.images.length > 0 && data.description ? 720 : 400;

  // If link showing placeholder
  let height = 140;

  if (
    data.contentType.startsWith("text/html") ||
    data.contentType.startsWith("audio")
  ) {
    height = 140;
  } else if (
    data.contentType.startsWith("image") ||
    data.contentType.startsWith("video")
  ) {
    height = 300;
  } else {
    height = 100;
  }

  if (!data.description && data.images?.length !== 0) {
    height -= 60;
  }

  return [width, height];
};

const adaptMeta = (d: Metadata): LinkPreviewMeta => {
  if (isHTML(d)) {
    return d;
  }

  if (isVideo(d)) {
    return {
      ...d,
      images: [],
      description: <video controls src={d.url} />,
      url: d.url,
    };
  }

  if (isAudio(d)) {
    return {
      ...d,
      images: [],
      description: <audio controls src={d.url} />,
    };
  }

  if (isImage(d)) {
    return {
      ...d,
      images: [],
      // eslint-disable-next-line @next/next/no-img-element
      description: <img src={d.url} alt="" />,
    };
  }

  return {
    ...d,
    images: [],
    description:
      d.error != null ? "Failed to load link metadata" : "loading ...",
  };
};

export function toLinkPreviewCardMeta(data: Metadata): LinkPreviewCardData {
  const meta = adaptMeta(data);
  const [width, height] = getCardSize(meta);

  return {
    ...meta,
    width,
    height,
  };
}
