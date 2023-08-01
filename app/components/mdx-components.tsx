/* eslint-disable react/display-name */
import React from "react";
import Image from "next/image";
import { getTweetIdFromUrl } from "../lib/utils";

import Link from "next/link";
import { Tweet } from "react-static-tweets";
import LinkPreview from "./link-preview";
import { Popover } from "./popover";
import { getPageById } from "../lib/notion-data";
import { FloatingNote } from "./floating-note";
import { TwitterTweetEmbed } from "./react-twitter-embed";
import LinkPreviewClient from "./link-preview.client";

const cx = (...args: (string | undefined)[]) => {
  return args.filter(Boolean).join(" ");
};

// RSC can't use React.Context. We need to pass the context to MDX explicitly.
interface MdxContext {
  notes?: Record<string, string>;
  tweetAstMap: Record<string, any>;
}

type WrappedProps<T extends React.HTMLAttributes<any>> = {
  context: MdxContext;
} & T;

const Anchor = async ({
  context,
  children,
  href,
  ...props
}: WrappedProps<React.AnchorHTMLAttributes<HTMLAnchorElement>>) => {
  const { notes, tweetAstMap } = context;
  if (!href) {
    return <a {...props}>{children}</a>;
  }
  if (children === "embed") {
    const tweetId = getTweetIdFromUrl(href);
    if (tweetId && tweetAstMap[tweetId]) {
      return <Tweet ast={tweetAstMap[tweetId]} />;
    } else if (tweetId) {
      // fallback to client rendering
      return <TwitterTweetEmbed tweetId={tweetId} />;
    }
  }
  if (
    typeof children === "string" &&
    ["bookmark", "link_preview"].includes(children)
  ) {
    return <LinkPreview url={href} />;
  }
  if (href.startsWith("/")) {
    const noteId = href.slice(1);

    if (notes?.[noteId]) {
      const noteHTML = notes[noteId];
      const note = <div dangerouslySetInnerHTML={{ __html: noteHTML }} />;
      return <FloatingNote label={children}>{note}</FloatingNote>;
    }
  }

  if ("link_to_page" === children) {
    try {
      const post = await getPageById(href, false);
      if (post) {
        return (
          <Link
            {...props}
            className={cx(props.className, "underline decoration-dashed")}
            href={"/posts/" + post.slug}
          >
            {post.name}
          </Link>
        );
      }
    } catch (__) {
      // ignore
    }
  }

  // transform notion links to nextjs links (if it is in the same database)
  if (
    href.startsWith("/posts/") ||
    href.startsWith("https://www.notion.so/") ||
    href.startsWith("/")
  ) {
    const pid = (href as string).split("/").pop();
    if (pid) {
      try {
        const post = await getPageById(pid, false);
        if (post) {
          return (
            <Link
              {...props}
              className={cx(props.className, "underline decoration-dashed")}
              href={"/posts/" + post.slug}
            >
              {children}
            </Link>
          );
        }
      } catch (__) {
        // ignore
      }
    }
  }

  return (
    <Popover content={<LinkPreviewClient url={href} />}>
      <a
        href={href}
        className={cx(props.className, "underline")}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    </Popover>
  );
};

const hWrapper = (Tag: string, defaultClassName: string) =>
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
  (Tag: React.FunctionComponent) =>
  ({ className, ...props }: React.AllHTMLAttributes<any>) => {
    return (
      <section className={cx("my-6 relative flex section-wrapper", className)}>
        {/* @ts-ignore */}
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

const wrapNative = (Tag: string, className?: string) =>
  React.forwardRef(({ className: c, ...props }: any, ref) => {
    return <Tag ref={ref} className={cx(className, c)} {...props} />;
  });

// Components to be injected to MDX
export const getMdxComponents = (ctx: MdxContext) => {
  const mdxComponents = {
    a: Anchor,
    Note: FloatingNote,
    // p -> div so that it won't complain that div is not a valid child of p
    p: wrapNative("div", "leading-ease"),
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

  type MdxTag = keyof typeof mdxComponents;

  (["p", "blockquote", "pre", "ul", "ol", "hr"] as MdxTag[]).forEach((tag) => {
    // @ts-ignore
    mdxComponents[tag] = createSectionWrapper(mdxComponents[tag]);
  });

  Reflect.ownKeys(mdxComponents).forEach((key) => {
    // @ts-ignore
    const Component = mdxComponents[key];
    // @ts-ignore
    mdxComponents[key] = (props) => <Component {...props} context={ctx} />;
  });

  return mdxComponents;
};
