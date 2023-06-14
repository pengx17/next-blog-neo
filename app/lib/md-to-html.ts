import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
// @ts-ignore
import rehypeAddClasses from "rehype-add-classes";
import rehypeSlug from "rehype-slug";

const remarkHtml = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeAddClasses, {
    a: "underline",
  })
  .use(rehypeStringify);

export const mdToHTML = (md: string) => {
  const vfile = remarkHtml.processSync(md);
  return String(vfile);
};
