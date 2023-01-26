"use client";

import React from "react";
import ReactDom from "react-dom";
import { useHoverDirty, useWindowSize } from "react-use";

export function FloatingNote({ label, children, ...props }) {
  const triggerRef = React.useRef<HTMLElement>(null);
  const [anchor, setAnchor] = React.useState<HTMLElement>(null);
  const asideRef = React.useRef<HTMLElement>(null);
  const triggerHovering = useHoverDirty(triggerRef);
  const asideHovering = useHoverDirty(asideRef, !!anchor);

  React.useEffect(() => {
    if (triggerRef.current && !anchor) {
      setTimeout(() => {
        let el = triggerRef.current;
        do {
          el = el?.parentElement;
        } while (el && el.tagName !== "SECTION");
        el = el?.querySelector("[data-aside-container]");
        setAnchor(el);
      }, 100);
    }
  }, [triggerRef, anchor]);

  // This will trigger re-render when window size changed.
  useWindowSize();

  const asideEl =
    anchor &&
    ReactDom.createPortal(
      <aside
        ref={asideRef}
        style={{
          borderColor: triggerHovering ? "rgba(31, 41, 55)" : null,
          lineHeight: 1.6,
        }}
        className="p-2 mb-1 text-gray-800 rounded border-2 text-xs bg-gray-100 transition hover:border-gray-800"
      >
        {children}
      </aside>,
      anchor
    );

  const asideVisible =
    !!asideEl &&
    window.getComputedStyle(anchor.parentElement).display !== "none";

  return (
    <span
      ref={triggerRef}
      style={{
        textDecorationStyle: "dotted",
        textDecorationColor: "rgba(31, 41, 55)",
        textDecorationLine: asideVisible ? "underline" : "none",
        textUnderlineOffset: "2px",
        backgroundColor: asideHovering ? "rgb(209, 213, 219)" : undefined,
      }}
      className="cursor-pointer hover:bg-gray-300 transition underline"
      {...props}
    >
      {label ?? "💭"}
      {asideEl}
    </span>
  );
}
