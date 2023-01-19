"use client";

import {
  TwitterContextProvider,
  TweetClient,
  // @ts-ignore
} from "react-static-tweets/client";
import { MDXRemote } from "next-mdx-remote";

import { type PostProperties } from "../../../../lib/data";
import { getTweetIdFromUrl } from "../../../../lib/utils";
import { Date } from "../../../date";

const components = {
  a: (props) => {
    if (props.children === "embed") {
      const tweetId = getTweetIdFromUrl(props.href);
      if (tweetId) {
        return <TweetClient id={tweetId} />;
      }
    }
    return <a {...props} target="_blank" rel="noopener noreferrer" />;
  },
};

export function PostRenderer({
  name,
  date,
  compiledSource,
  tweetAstMap,
}: PostProperties & {
  compiledSource: string;
  tweetAstMap: Record<string, any>;
}) {
  return (
    <TwitterContextProvider value={{ tweetAstMap }}>
      <h1 className="my-6 text-4xl font-serif font-bold leading-snug">
        {name}
      </h1>
      <div className="text-gray-600 mb-8 ml-0.5">
        <Date dateString={date} />
      </div>
      <MDXRemote compiledSource={compiledSource} components={components} />
    </TwitterContextProvider>
  );
}
