"use client";

import { MDXRemote } from "next-mdx-remote";
// @ts-ignore
import { TwitterContextProvider } from "react-static-tweets/client";

import { type PostProperties } from "../../../../lib/data";
import { Date } from "../../../date";
import { notesContext } from "./notes-context";
import { mdxComponents } from "./wrappers";

export function PostRenderer({
  name,
  date,
  notes,
  compiledSource,
  tweetAstMap,
}: PostProperties & {
  notes?: Record<string, string>;
  compiledSource: string;
  tweetAstMap?: Record<string, any>;
}) {
  return (
    <TwitterContextProvider value={{ tweetAstMap }}>
      <notesContext.Provider value={notes}>
        <h1 className="my-6 text-4xl font-serif font-bold leading-snug">
          {name}
        </h1>
        <div className="text-gray-600 mb-8 ml-0.5">
          <Date dateString={date} />
        </div>
        <MDXRemote
          compiledSource={compiledSource}
          // @ts-ignore
          components={mdxComponents}
        />
      </notesContext.Provider>
    </TwitterContextProvider>
  );
}
