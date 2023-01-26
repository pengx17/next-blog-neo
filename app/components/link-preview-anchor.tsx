"use client";

import React from "react";
import Tippy from "@tippyjs/react";

import LinkPreview from "./link-preview";

export function LinkPreviewAnchor({ ...props }) {
  return (
    <Tippy
      interactive
      delay={100}
      animation="fade"
      maxWidth={620}
      arrow={false}
      content={<LinkPreview url={props.href} />}
    >
      <a style={{ textDecorationLine: "underline" }} {...props} />
    </Tippy>
  );
}
