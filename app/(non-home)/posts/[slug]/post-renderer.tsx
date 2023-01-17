import { getPostHTML, PostProperties } from "../../../../lib/data";
import { Date } from "../../../date";
import { use } from "react";

export function PostRenderer({ id, name, date }: PostProperties) {
  return (
    <>
      <h1 className="my-6 text-4xl my-4 font-serif font-bold leading-snug">
        {name}
      </h1>
      <div className="text-gray-600 mb-8 ml-0.5">
        <Date dateString={date} />
      </div>
      <div
        className="post-content"
        dangerouslySetInnerHTML={{
          __html: use(getPostHTML(id)),
        }}
      />
    </>
  );
}
