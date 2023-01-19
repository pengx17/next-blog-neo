import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypePrism from "rehype-prism-plus";
import rehypeStringify from "rehype-stringify";
import rehypeAddClasses from "rehype-add-classes";
import rehypeSlug from "rehype-slug";
import { cache } from "react";

const remarkHtml = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypePrism)
  .use(rehypeSlug)
  .use(rehypeStringify);

export const mdToHTML = cache((md: string) => {
  const vfile = remarkHtml.processSync(md);
  return String(vfile);
});
