"use client";

import React from "react";
import { InView } from "react-intersection-observer";

export default function LazyVisible({
  children,
}: {
  children: React.ReactNode | (() => React.ReactNode);
}) {
  const [visible, setVisible] = React.useState(false);
  const el = React.useMemo(() => {
    if (!visible) {
      return null;
    }
    if (typeof children === "function") {
      return children();
    }
    return children;
  }, [children, visible]);
  return (
    <InView
      as="div"
      onChange={(inView) => {
        if (inView) {
          setVisible(true);
        }
      }}
    >
      {el}
    </InView>
  );
}
