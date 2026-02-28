
## 博客再一次更新核心实现！


为什么说再一次呢？从一开始我在 CSDN 水了一些文章后，后续使用 Jekyll + GitHub Pages，再后来的 Next.js + MDX + Vercel，而这一次参考了 [https://www.bypaulshen.com/posts/replacing-mdx-with-notion](https://www.bypaulshen.com/posts/replacing-mdx-with-notion) , 使用 Next.js 13 App Layout + Notion（作为博客的内容管理后台 CMS），其实已经经过了好几次的技术迭代了。


这次的技术亮点主要是尽可能的把内容通过 Next.js 13 的服务端组件技术（React Server Components）提前把博客内容渲染：首先，在服务器组件部分通过 `notion-to-md` 把 Notion 上的文章下载为 markdown，然后使用 `next-mdx-remote/rsc` 将 md 转化为 React 服务器组件，这样就为客户端支持灵活的注入替换 HTML 标签的功能变成可能。


![](/notion-images/60b85854-73a1-4c2c-8ffa-25d871a56f59.png)


比如，[增加嵌入 tweet 的功能](/15bcea9128dd4f0d9721997a44a378a1)：在服务器组件渲染中，将 markdown 内容里嵌入的 tweet 提前在通过 [`static-tweets`](https://github.com/transitive-bullshit/react-static-tweets) 静态渲染为 AST；再在客户端渲染时通过 `<MDXRemote />` 的 components 参数，将 `<a href="http://twitter.com/.../status/tweet-id">embed</a>` 替换为服务器组件 `<Tweet />`。


[embed](https://twitter.com/pengx17/status/1615393070564147200)


很多人（包括我）热衷于给自己的博客用上各种 state-of-art 的技术。一旦博客架子搭起来后，开始还有点三分钟热度写点文章，然后博客就再也没更新过。说到底，是因为与产出文章相比，我们能从搭博客架子这件事中能更快获得成功的快感 🤌。


这次换成用 Notion 作为管理博客内容的 CMS，降低了写博客这件吃力不讨好的事的厚重仪式感，也许能提升我产出文章的动力。


[link_preview](https://github.com/pengx17/next-blog-neo)


[博客仓库](https://github.com/pengx17/next-blog-neo)本身在技术稳定后也许就不用再更新了，不过我后续可能会支持博客中展示 inline comment 的功能。这个等我以后有空了再实现吧（也许到那时候整体架子又换了一整套说不定 😳。


### Update on January 19:


借鉴了一下 [https://www.bypaulshen.com](https://www.bypaulshen.com/posts/replacing-mdx-with-notion) 插入浮动窗口的实现，[浮动笔记](/7028d61a61a5447ab7a631a9d9572452)已经支持，同时用[next-mdx-remote/rsc](https://github.com/hashicorp/next-mdx-remote#react-server-components-rsc--nextjs-app-directory-support)增加了服务器组件支持，这样基本上大多数的远程数据都可以在构建时提前在服务端渲染，大大减少了客户端的网络请求数量。

