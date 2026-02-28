
本站通过 Next.js function + MDX 的组合拳，为文章内的外链提供了**鼠标悬停**与**内联卡片**两种渲染模式的[预览支持](https://pengx17.vercel.app/posts/link-preview)。对于 Logseq，我们可以尝试用插件 API 为其提供类似的功能。


![](/__NOTION_IMAGE__71ae4041-7933-4c1a-8141-1b05df86b1f4__)


[在前面的博客](https://pengx17.vercel.app/posts/link-preview)里, 我介绍了将任意外链渲染为卡片模板的方法。为了在 Logseq 里实现两种渲染模式，我们还需要解决其他问题。


## **鼠标悬停**


### **目标：当鼠标移动到外部链接时，在悬停位置显示链接的预览图。**


Logseq 插件 API 目前没有提供 `mouseenter` 或 `mouseleave` 事件的 API，但我们可以监听主视图中的 `mouseenter` 事件作为 workaround。 当事件中的 `target` 为外链 (`className === "external-link"`) 时，在锚点位置渲染预览图。如下的 `useHoveringExternalLink` React Hook 会返回当前鼠标悬停的外链锚点元素。


```javascript
const useHoveringExternalLink = () => {
  const [anchor, setAnchor] = React.useState<HTMLAnchorElement | null>(null);
  const currentAnchor = React.useRef(anchor);

  React.useEffect(() => {
    const enterAnchorListener = (e: MouseEvent) => {
      const target = e.composedPath()[0] as HTMLAnchorElement;
      if (
        target.tagName === "A" &&
        target.href &&
        target.className.includes("external-link")
      ) {
        setAnchor(target);
        currentAnchor.current = target;
        target.addEventListener(
          "mouseleave",
          () => {
            setAnchor(null);
          },
          { once: true }
        );
      }
    };

    const enterIframeListener = (e: MouseEvent) => {
      setAnchor(currentAnchor.current);
      document.addEventListener(
        "mouseleave",
        () => {
          setAnchor(null);
        },
        { once: true }
      );
    };

    top?.document.addEventListener("mouseenter", enterAnchorListener, true);
    document.addEventListener("mouseenter", enterIframeListener, true);
    return () => {
      top?.document.removeEventListener(
        "mouseenter",
        enterAnchorListener,
        true
      );
      document.removeEventListener("mouseenter", enterIframeListener, true);
    };
  }, []);
  return anchor;
};
```


解决了获取当前悬停外链的问题后，我们就可以通过调用 `https://logseq-plugin-link-preview.vercel.app/api/link-preview?url=URL` 获取到链接的元数据，然后将结果交给 `<LinkCard />` 组件渲染。卡片的悬浮位置可通过外链元素的 `getBoundingClientRect`，通过 `logseq.setMainUIInlineStyle` 动态设置 iframe 的样式，以实现悬停位置的自适应调整。


```javascript
const useAdaptViewPort = (
  data: LinkPreviewMetadata | null,
  anchor: HTMLAnchorElement | null
) => {
  React.useEffect(() => {
    if (data && anchor && top) {
      logseq.showMainUI();
      const elemBoundingRect = anchor.getBoundingClientRect();
      const [width, height] = getCardSize(data);
      let left = (elemBoundingRect.left + elemBoundingRect.right - width) / 2;
      const right = left + width;
      const oversize = Math.max(right - top.visualViewport.width, 0);
      left = Math.max(left - oversize, 0);
      let vOffset =
        elemBoundingRect.top - height > 0
          ? elemBoundingRect.top - height - 8
          : elemBoundingRect.top + elemBoundingRect.height + 8;
      logseq.setMainUIInlineStyle({
        top: vOffset + `px`,
        left: left + `px`,
        width: width + `px`,
        height: height + `px`,
        zIndex: 20,
        filter: "drop-shadow(0 0 12px rgba(0, 0, 0, 0.2))",
        position: "fixed",
      });
    } else {
      logseq.hideMainUI();
    }
  }, [anchor, data]);
};
```


### **问题：悬停外链显示预览图时编辑焦点丢失**


由于插件与主视图在不同的 frame 上下文，鼠标在悬停外链并显示卡片时，页面的焦点会自动切换到悬浮卡片上。这样会导致编辑焦点丢失的问题，多少会影响用户更连贯的输入体验。


我的解决办法比较 _hack_ ：在 `React.useEffect` 中监听插件上下文中的 `document` 的 `focus` 事件。当焦点切换到插件主窗口时，主动把焦点重新设置为主窗口，并通过 `logseq.Editor.restoreEditingCursor` 还原编辑状态。代码同样也封装成了 React Hook：


```javascript
// Makes sure the user will not lose focus (editing state) when previewing a link
export const usePreventFocus = () => {
  React.useEffect(() => {
    let timer = 0;
    const listener = () => {
      setTimeout(() => {
        if (window.document.hasFocus()) {
          (top as any).focus();
          logseq.Editor.restoreEditingCursor();
        }
      });
    };
    timer = setInterval(listener, 1000);
    window.addEventListener("focus", listener);
    return () => {
      window.removeEventListener("focus", listener);
      clearInterval(timer);
    };
  });
};
```


## **内联卡片**


### **目标：注册** **`/Convert to Link Card`** **命令**


用户输入 URL 后，我们可以借助 `/Convert to Link Card` 命令将用户输入的 URL 转化为 `{{renderer :linkpreview,URL}}` 文本，这样就可以再交给自定义 Macro （宏） 渲染内联外链卡片了。


```javascript
logseq.Editor.registerSlashCommand("Convert to Link Card 🪧", async () => {
  const maybeUrl = (await logseq.Editor.getEditingBlockContent()).trim();
  const id = await logseq.Editor.getCurrentBlock();

  if (urlRegex.test(maybeUrl) && id) {
    const newContent = `{{renderer ${macroPrefix},${maybeUrl}}}`;
    logseq.Editor.updateBlock(id.uuid, newContent);
  } else {
    logseq.App.showMsg(
      "The block content does not seem to be a valid URL",
      "warning"
    );
  }
});
```


### **目标：自定义宏(Macro)渲染**


Logseq 中的宏与编程语言的宏概念类似。我们的接下来的目标就是将 `{{renderer :linkpreview,http://www.baidu.com}}` 文本渲染成相应 HTML 模板：


```javascript
<a
  rel="noopener noreferrer"
  href="http://www.baidu.com/"
  class="link_preview__root"
  style="width:720px;height:140px"
  ><div class="link_preview__card-container">
    <div class="link_preview__text-container">
      <div class="link_preview__text-container-title">百度一下，你就知道</div>
      <div class="link_preview__text-container-description">
        全球领先的中文搜索引擎、致力于让网民更便捷地获取信息，找到所求。百度超过千亿的中文网页数据库，可以瞬间找到相关的搜索结果。
      </div>
      <div class="link_preview__text-container-url-container">
        <img
          height="16"
          width="16"
          src="http://www.baidu.com/img/baidu_85beaf5496f291521eb75ba38eacbd87.svg"
        /><span class="text-container-url">http://www.baidu.com/</span>
      </div>
    </div>
    <div class="link_preview__cover-container">
      <img
        alt="cover"
        src="http://ss.bdimg.com/static/superman/img/topnav/baiduyun@2x-e0be79e69e.png"
        class="link_preview__cover-image"
      />
    </div></div
></a>
```


宏注册相关的代码如下：


```javascript
logseq.App.onMacroRendererSlotted(async ({ payload, slot }) => {
  const [type, url] = payload.arguments;
  if (!type?.startsWith(macroPrefix)) {
    return;
  }

  const render = (data) => {
    const inner = ReactDOMServer.renderToStaticMarkup(
      <LinkCard data={toLinkPreviewMetadata(url, null, data)} />
    );
    logseq.provideUI({
      key: "linkpreview",
      slot,
      reset: true,
      template: `<span data-on-click="openExternalLink" data-url="${url}">${inner}</span>`,
    });
  };

  // 渲染 Loading 状态
  render();

  // 获得元数据后，渲染为标准的 HTML
  render(await fetchLinkPreviewMetadata(url));
});
```


利用 React SSR/SSG 中常用的 `ReactDOMServer.renderToStaticMarkup` 函数，我们可以复用 `LinkCard` React 组件，将 ReactElement 输出为 HTML 字符串。


### **问题：提供模板样式**


`LinkCard` 所需要的样式 `style.css` 默认只会在 `iframe` 内生效。我们需要找到一个办法，将相关的样式也能在主视图中生效。


目前 `LinkCard` 的实现中，CSS 是以全局样式文件 `style.css` 注入到 iframe 上下文的。同样的，我们可以将 `style.css` 读取为纯文本字符串，通过 `logseq.provideStyle` 注册到主视图中。


## **完**


以上是 `logseq-plugin-link-preview` 插件的基本思路。从功能来讲，它已经比较完整了，但我认为还有以下问题：

- 离 Notion 等成熟产品中的外链预览功能来说还有一定差距。问题还是主要在于对外链内容的正确解析上。比如，Notion 在发现用户的外链是一个 GitHub 的 Issue 的时候，会尝试通过 GitHub API 获取 Issue 的标题、描述、状态等信息进行定制化渲染，但我们其实只依赖于目标网站的 Open Graph 标签，所以能获得的信息不一定足够丰富。
- 需要穿透 `iframe` 沙盒直接在顶层上下文内注册事件。这一点阻碍了插件是否可以发布到 Logseq Marketplace 中。

---


项目地址: [logseq-plugin-link-preview](https://github.com/pengx17/logseq-plugin-link-preview)

