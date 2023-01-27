"use client";

import React from "react";
import Tippy from "@tippyjs/react";

export function Popover({ content, children }) {
  const appendTo = typeof document === "undefined" ? null : document.body;
  return (
    <Tippy
      interactive
      delay={100}
      animation="fade"
      maxWidth={620}
      arrow={false}
      content={content}
      appendTo={appendTo}
    >
      {children}
    </Tippy>
  );
}
