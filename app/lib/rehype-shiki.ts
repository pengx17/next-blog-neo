// Credits: https://github.com/mdx-js/mdx/discussions/1939#discussioncomment-2214962
import path from "path";
import rehypeParse from "rehype-parse";
import * as shiki from "shiki";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const themes = ["github-light"];
let _hl$: Promise<shiki.Highlighter>;

const rehypeShiki = () => async (tree: any) => {
  if (!_hl$) {
    _hl$ = shiki.getHighlighter({
      themes,
      paths: {
        themes: path.resolve(process.cwd(), "./.shiki/themes"),
        languages: path.resolve(process.cwd(), "./.shiki/languages"),
      },
    });
  }

  const highlighter = await _hl$;

  visit(tree, (node, index, parent) => {
    if (node.tagName === "code" && parent.tagName !== "pre") {
      node.properties.className = "inline-code";
      return;
    }

    // If child is pre, but it contains no code
    if (
      !(
        node.tagName === "pre" &&
        node.children?.[0]?.tagName === "code" &&
        node.children?.[0]?.properties?.className?.[0].startsWith(
          "language-"
        ) &&
        node.children?.[0]?.children?.[0]?.type === "text"
      )
    ) {
      return;
    }

    let code = node.children[0].children[0].value;
    let lang = node.children[0].properties.className[0].slice(
      "language-".length
    );

    parent.children.splice(
      index,
      1,
      ...themes.map((theme) => {
        let n = unified()
          .use(rehypeParse, { fragment: true })
          .parse(highlighter.codeToHtml(code, { theme, lang }));

        // The pre's parent
        // @ts-expect-error ???
        n.children[0].properties.className.push(theme);
        return n;
      })
    );
  });
};

export default rehypeShiki;
