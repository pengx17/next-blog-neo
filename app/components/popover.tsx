"use client";

import React from "react";
import Tippy from "@tippyjs/react";

export function Popover({
  content,
  children,
}: {
  content: React.ReactNode;
  children: React.ReactElement;
}) {
  const appendTo = typeof document === "undefined" ? undefined : document.body;
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
