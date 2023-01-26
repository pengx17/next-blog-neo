"use client";

import React from "react";
import Tippy from "@tippyjs/react";

export function Popover({ content, children }) {
  return (
    <span className="inline-block">
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
    </span>
  );
}
