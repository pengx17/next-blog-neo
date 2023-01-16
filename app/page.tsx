import Link from "next/link";
import {Date} from "./date";
import { getPosts } from "../lib/data";

export default async function Home() {
  const posts = await getPosts();
  return (
    <section className="w-screen h-screen flex sm:items-center justify-self-center flex-col sm:flex-row">
      <div className="sm:flex-1 pl-12 py-2 mt-2 inline font-serif font-semibold">
        <span className="text-4xl sm:text-5xl">Index</span>
        <span className="text-gray-600 text-lg ml-1">
          <Link href="/about">pengx17</Link>
        </span>
      </div>
      <div className="sm:flex-1 sm:py-24 max-h-full overflow-auto px-12 py-12">
        {posts.map(({ slug, date, name }) => (
          <div className="mb-6" key={slug}>
            <Link
              href={`/posts/${slug}`}
              className="text-xl font-semibold font-serif"
            >
              {name}
            </Link>
            <br />
            <span className="text-xs text-gray-600">
              <Date dateString={date} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
