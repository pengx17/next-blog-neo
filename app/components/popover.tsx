"use client";

import React, { useState } from "react";
import {
  useFloating,
  FloatingPortal,
  useHover,
  useInteractions,
} from "@floating-ui/react";

const cx = (...args: string[]) => {
  return args.filter(Boolean).join(" ");
};

export function Popover({
  content,
  children,
}: {
  content: React.ReactNode;
  children: React.ReactElement;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });
  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);
  return (
    <>
      {isOpen && (
        <FloatingPortal>
          <div
            {...getFloatingProps()}
            ref={refs.setFloating}
            style={floatingStyles}
            className={cx("w-[620px]")}
          >
            {content}
          </div>
        </FloatingPortal>
      )}
      <span ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </span>
    </>
  );
}
