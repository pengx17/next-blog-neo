"use client";

import React from "react";
import Tippy from "@tippyjs/react";

export function Popover({ content, children }) {
  return (
    <Tippy
      interactive
      delay={100}
      animation="fade"
      maxWidth={620}
      arrow={false}
      content={content}
    >
      {children}
    </Tippy>
  );
}
