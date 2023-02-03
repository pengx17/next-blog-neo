export interface BaseType {
  mediaType?: string;
  contentType?: string;
  favicons?: string[];
  url: string;
  error?: any;
}

export interface PlaceholderType extends BaseType {
  contentType: "placeholder";
}

export interface HTMLResponse extends BaseType {
  title: string;
  siteName: string;
  description: string;
  images: string[];
  videos: string[];
  contentType: `text/html${string}`;
}

export interface AudioResponse extends BaseType {
  contentType: `audio/${string}`;
}

export interface ImageResponse extends BaseType {
  contentType: `image/${string}`;
}

export interface VideoResponse extends BaseType {
  contentType: `video/${string}`;
}

export interface ApplicationResponse extends BaseType {
  contentType: `application/${string}`;
}

export type Metadata =
  | HTMLResponse
  | AudioResponse
  | ImageResponse
  | VideoResponse
  | ApplicationResponse
  | PlaceholderType;

export type LinkPreviewMeta = Pick<
  Metadata,
  "contentType" | "error" | "favicons" | "mediaType" | "url"
> & {
  title?: string;
  description?: React.ReactNode;
  images?: string[];
};

export type LinkPreviewCardData = LinkPreviewMeta & {
  width: number;
  height: number;
}
