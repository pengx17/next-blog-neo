"use client";

import {
  TwitterContextProvider,
  TweetClient,
  // @ts-ignore
} from "react-static-tweets/client";
import { MDXRemote } from "next-mdx-remote";
import React from "react";

import { type PostProperties } from "../../../../lib/data";
import { getTweetIdFromUrl } from "../../../../lib/utils";
import { Date } from "../../../date";
import { mdToHTML } from "../../../../lib/md-to-html";

const notesContext = React.createContext<Record<string, string>>({});

const NoteLink = ({ className, id, note, children }) => {
  const notesHtml = mdToHTML(note);
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    if (ref.current) {
      console.log(ref.current)
    }
  }, []);
  return (
    <>
      <span
        ref={ref}
        data-note-id={id}
        data-note={note}
        className={
          className +
          " decoration-dotted cursor-default hover:bg-slate-100 inline-block"
        }
      >
        {children}
      </span>
    </>
  );
};

const components = {
  a: (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const notes = React.useContext(notesContext);
    if (props.children === "embed") {
      const tweetId = getTweetIdFromUrl(props.href);
      if (tweetId) {
        return <TweetClient id={tweetId} />;
      }
    }
    if (props.href.startsWith("/")) {
      const noteId = props.href.slice(1);

      if (notes[noteId]) {
        return (
          <NoteLink
            note={notes[noteId]}
            id={noteId}
            className={props.className}
          >
            {props.children}
          </NoteLink>
        );
      }
    }
    return <a {...props} target="_blank" rel="noopener noreferrer" />;
  },
};

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
        <MDXRemote compiledSource={compiledSource} components={components} />
      </notesContext.Provider>
    </TwitterContextProvider>
  );
}
