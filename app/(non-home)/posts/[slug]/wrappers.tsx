/* eslint-disable react/display-name */
import React from "react";
import { getTweetIdFromUrl } from "../../../lib/utils";

import Link from "next/link";
import { Tweet } from "react-static-tweets";
import LinkPreview from "../../../components/link-preview";
import { FloatingNote } from "./floating-note";
import { LinkPreviewAnchor } from "../../../components/link-preview-anchor";

const cx = (...args: string[]) => {
  return args.filter(Boolean).join(" ");
};

const Anchor = ({ context, ...props }) => {
  const { notes, tweetAstMap } = context;
  if (props.children === "embed") {
    const tweetId = getTweetIdFromUrl(props.href);
    if (tweetId) {
      return <Tweet ast={tweetAstMap[tweetId]} />;
    }
  }
  if (props.children === "bookmark") {
    return <LinkPreview url={props.href} />;
  }
  if (props.href.startsWith("/")) {
    const noteId = props.href.slice(1);

    if (notes?.[noteId]) {
      const noteHTML = notes[noteId];
      const note = <div dangerouslySetInnerHTML={{ __html: noteHTML }} />;
      return <FloatingNote label={props.children}>{note}</FloatingNote>;
    } else {
      return <Link {...props} href={"/posts" + props.href} />;
    }
  }
  return <LinkPreviewAnchor {...props} />;
};

const hWrapper = (Tag, defaultClassName) =>
  React.forwardRef(({ className, children, ...rest }: any, ref) => {
    return (
      <Tag
        ref={ref}
        className={cx("font-serif relative", className, defaultClassName)}
        {...rest}
      >
        <>
          {children}
          <span
            style={{
              position: "absolute",
              right: "calc(100% + .2rem)",
              opacity: ".1",
              top: "calc(50% - .4em)",
              fontSize: "0.6em",
              lineHeight: 1,
            }}
            className="font-normal font-mono uppercase select-none"
          >
            {Tag}
          </span>
        </>
      </Tag>
    );
  });

export const createSectionWrapper =
  (Tag) =>
  ({ className, ...props }) => {
    return (
      <section className={cx("my-6 relative flex", className)}>
        <Tag className="flex-1" {...props} />
        <aside className="hidden md:block md:w-48 lg:block lg:w-64 xl:w-72 h-full left-full pl-2 flex-shrink-0">
          <div
            className="sticky right-0 top-4 bottom-4 min-h-full"
            data-aside-container
          />
        </aside>
      </section>
    );
  };

const wrapNative = (Tag, className?: string) =>
  React.forwardRef(({ className: c, ...props }: any, ref) => {
    return <Tag ref={ref} className={cx(className, c)} {...props} />;
  });

// RSC can't use React.Context. We need to pass the context to MDX explicitly.
interface MdxContext {
  notes: Record<string, string>;
  tweetAstMap: Record<string, any>;
}

// Components to be injected to MDX
export const getMdxComponents = (ctx: MdxContext) => {
  const mdxComponents = {
    a: Anchor,
    // inline code
    code: (props) => {
      if (typeof props.children === "string") {
        return (
          <code
            className="bg-gray-100 rounded"
            style={{ fontSize: "0.8em", padding: "0.1em 0.2em", lineHeight: 1 }}
          >
            {props.children?.trim()}
          </code>
        );
      } else {
        return <code {...props} />;
      }
    },
    p: wrapNative("p", "leading-ease"),
    h1: hWrapper("h1", "text-3xl font-bold my-12 mb-8"),
    h2: hWrapper("h2", "text-2xl font-bold mt-12 mb-8"),
    h3: hWrapper("h3", "text-xl font-bold mt-8 mb-6"),
    h4: hWrapper("h4", "text-xl font-bold my-4 text-gray-800"),
    // Should not use H5 & H6
    hr: wrapNative("hr", "h-1.5 border-gray-400 border-t border-b my-4"),
    blockquote: wrapNative(
      "blockquote",
      "py-0.5 px-4 border-green-900 border-l-4"
    ),
    pre: wrapNative(
      "pre",
      "text-[13px] p-4 !bg-gray-100 leading-ease w-full overflow-auto rounded"
    ),
    ul: wrapNative("ul", "list-disc pl-10 leading-ease"),
    ol: wrapNative("ol", "list-decimal pl-10 leading-ease"),
  };

  ["p", "blockquote", "pre", "ul", "ol", "hr"].forEach((tag) => {
    mdxComponents[tag] = createSectionWrapper(mdxComponents[tag]);
  });

  Reflect.ownKeys(mdxComponents).forEach((key) => {
    const Component = mdxComponents[key];
    mdxComponents[key] = (props) => <Component {...props} context={ctx} />;
  });

  return mdxComponents;
};
