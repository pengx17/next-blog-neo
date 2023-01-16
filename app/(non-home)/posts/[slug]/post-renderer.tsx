import { getPostById, PostProperties } from "../../../../lib/data";
import { createSectionWrapper } from "./components";
import { Date } from "../../../date";
import { use } from "react";

const WrappedH1 = createSectionWrapper("h1");

export function PostRenderer({ id, name, date }: PostProperties) {
  return (
    <>
      <WrappedH1 className="text-4xl my-4 font-serif font-bold leading-snug">
        {name}
      </WrappedH1>
      <div className="text-gray-600 mb-8 ml-0.5">
        <Date dateString={date} />
      </div>
      <PostBlocks id={id} />
    </>
  );
}

function PostBlocks({ id }: { id: string }) {
  const post = use(getPostById(id));
  return (
    <>
      <section></section>
      <pre>{JSON.stringify(post, null, 2)}</pre>
    </>
  );
}
