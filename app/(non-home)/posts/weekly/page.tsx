import { getPageById } from "../../../lib/notion-data";
import { PostRenderer } from "../../post-renderer";

export default async function Post() {
  const page = await getPageById("cff234b9bbf0406fb80d410a75661294");

  if (!page) {
    return null;
  }

  return (
    <div className="w-full">
      <h1 className="font-serif text-4xl font-bold mt-4 mb-2">我的周报</h1>
      <PostRenderer name={page.name} id={page.id} />
    </div>
  );
}

export const revalidate = 60;
