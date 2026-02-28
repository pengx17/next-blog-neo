> Disclaimer: 本人没有使用过 Qiankun，我只是看了一下它的源码与接口文档，内容仅供参考。

最近因工作需要调研了一下 [Qiankun/乾坤](https://qiankun.umijs.org/zh) 微前端框架的[沙箱机制](/d10be5e403fe41f5ad0cbf2b0afbb79e)实现思路。 Qiankun 在其主页上声称，它是“简单、完备、生产可用”的。它的目标，是让一个前端应用在不做专门适配的情况下就可以注册为子应用，嵌入到一个微前端应用的基座容器中正常渲染。


Qiankun 选用了比较成熟的 [single-spa](https://single-spa.js.org/) 作为微前端应用的“驱动”。 为了将任意的 Web 应用直接作为微前端子应用使用，它还需要有一些技术难点需要攻克，比如：

- JS 全局变量 `window` 的隔离
- CSS 样式的隔离
- 子应用的路由隔离，[可参考这里](https://zhuanlan.zhihu.com/p/355419817)
- 切换应用时需要把子应用的副作用、内存泄漏等清理掉
- 等等

在框架的提供的外部 API 与内部具体实现的权衡中，Qiankun 试图把沙箱的实现复杂度封装在框架内部，以便于开发者可以把任务中心放在业务实现上，尽量减轻沙箱机制对于开发者造成的心智负担。


一般来说，一个普通的 Web 应用没有考虑到会被作为微前端子应用使用，自然地开发者在开发时也不会对全局变量的使用有任何顾虑。以 Qiankun 的愿景来看，它不希望子应用那边在源码级别做过多的改动，那么就需要在运行时多做一点文章。


## **初探运行时沙箱实现原理**


iframe 是一种特性完备的浏览器沙箱。[但 Qiankun 设计者认为](https://zhuanlan.zhihu.com/p/451425684)，iframe 会造成一些体验上的问题，因此从最开始就排除了将 iframe 作为微前端方案的核心。


JS 沙箱与 CSS 沙箱分别有各自的隔离机制。


### **JS 沙箱**


JS 沙箱目前还没有主流浏览器支持的成熟方案。 虽然 TC39 的 [ShadowRealm API](https://tc39.es/proposal-shadowrealm/) 提案未来可期，同时社区中有一些 Polyfill 实现，不过它目前还处于很早期的草案阶段，很难作为生产环境方案使用。


调研前，以我对 Qiankun 粗浅的理解，它的 JS 沙箱是基于 ES6 中的 [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 实现的。 在初始化后，Qiankun 会为任意一个子应用实例化专用的 Proxy；在运行时，它会通过"**某种方式**"将子应用 js 模块对 `window` 对象的访问重新定向到各自的 Proxy 实例上。


对于[非 esm 模式打包](/3b84f31af94943c1a030fdfbbdd32580)的 JS 资源，我们可以认为其内容就是直接会在全局上下文执行的脚本，我们可以用一个函数包裹整个脚本，并提供 `window` 等对象上下文:


```javascript
(function (window) {
  // bundled js script ...
})(proxiedWindow);
```


这篇 [Figma 的博客文章](https://www.figma.com/blog/how-we-built-the-figma-plugin-system/#attempt-3-realms)也提到了类似的用 `with()` 这种比较生僻的 JS 语法替换 window 的方式。


现在我们有办法替换 JS 运行环境的 window 上下文了，但我们还需要找到在运行时包裹子应用 JS 脚本的方案。Qiankun 使用了一种巧妙（括弧 Hack）的方式在运行时对子应用模块中全局变量访问进行重定向。


### **import-html-entry**


[import-html-entry](https://github.com/kuitos/import-html-entry) 是 Qiankun 的核心依赖之一。 它可以把任意一个 index.html 文件作为静态资源入口清单进行分析，抽取其中的 JS/CSS 等资源，返回一个 `execScripts` 接口让开发者可以更灵活的执行脚本。其中 `execScripts` 有一个重要功能，它可以让开发者动态的提供 window 上下文。


通过这个库，Qiankun 实现了以子应用的 index.html 作为入口加载 JS/CSS 资源，并将其中 JS 的执行上下文替换为 Proxy 实例。


[首先](https://github.com/kuitos/import-html-entry/blob/7432e56fc9497ccfdbcfdc24e0fe3a3b8156bed6/src/index.js#L54-L65)，它把子应用的 js 上下文中的 window, globalThis 和 self 替换为 Proxy：


```javascript
function getExecutableScript(scriptSrc, scriptText, proxy, strictGlobal) {
  const sourceUrl = isInlineCode(scriptSrc)
    ? ""
    : `//# sourceURL=${scriptSrc}\n`;

  // 通过这种方式获取全局 window，因为 script 也是在全局作用域下运行的，
  // 所以我们通过 window.proxy 绑定时也必须确保绑定到全局 window 上
  // 否则在嵌套场景下， window.proxy 设置的是内层应用的 window，
  // 而代码其实是在全局作用域运行的，会导致闭包里的 window.proxy 取的是最外层的微应用的 proxy
  const globalWindow = (0, eval)("window");
  globalWindow.proxy = proxy;
  return `;(function(window, self, globalThis){;${scriptText}\n${sourceUrl}})
    .bind(window.proxy)(window.proxy, window.proxy, window.proxy);`;
}
```


[之后](https://github.com/kuitos/import-html-entry/blob/7432e56fc9497ccfdbcfdc24e0fe3a3b8156bed6/src/index.js#L162-L169)，就可以通过 eval ，在运行时把基座应用为子应用创建的 proxy 传入 JS 上下文：


```javascript
const geval = (scriptSrc, inlineScript) => {
  const rawCode = beforeExec(inlineScript, scriptSrc) || inlineScript;
  const code = getExecutableScript(scriptSrc, rawCode, proxy, strictGlobal);

  evalCode(scriptSrc, code);
  afterExec(inlineScript, scriptSrc);
};
```


不过这个库有[其局限性](https://github.com/umijs/qiankun/issues/756)，它会直接[忽略掉](https://github.com/kuitos/import-html-entry/blob/7432e56fc9497ccfdbcfdc24e0fe3a3b8156bed6/src/process-tpl.js#L153) `type="module"` 的 SCRIPT 标签。 由于 import-html-entry 需要通过 `eval` 机制执行脚本并提供执行上下文，这样导致 ESM 模块无法实现沙盒机制。


据称借助 ShadowRealm Polyfill，如 [shadowrealm-api](https://github.com/ambit-tsai/shadowrealm-api)，就可以实现对于 ESM 的 window 劫持，~~不过我还没有做过具体调研~~。


### **CSS 隔离**


对于 CSS 来说，Qiankun 的主要维护者 Kuitos 在 [Qiankun 快问快答](https://zhuanlan.zhihu.com/p/451425684) 中推荐应用本身在构建时就做好样式隔离，这样它被作为子应用使用时天然就具备了隔离特性。 不过 Qiankun 还是在运行时提供了的样式隔离机制，其原理是拦截子应用样式表，将所有 class 加上一个特殊的前缀，避免冲突；同时在新版本中，它还支持以 Shadow DOM 的模式隔离子应用的 CSS。


另外，一些基于运行时的 CSS-in-JS 框架，如 Emotion、styled-components、或是 Webpack 的 style-loader 会把样式动态的向根部页面的 HEAD 标签插入 STYLE。这里有两个问题：

- 假如子应用被隔离在 shadow dom 中时，由于 shadow dom 的隔离特性，样式标签需要加入相应的 shadow root 中，而不是根部模板 HEAD 中
- 子应用卸载时，需要清理子应用动态插入的样式标签

Qiankun 在 window proxy 的 setter/getter 中注册了一些钩子：当子应用视图向根部模板 HEAD 插入动态样式时，它会把插入的位置重定向到当前激活应用的 shadow dom 中的位置。


对于当前激活应用，Qiankun 也在这里有个“巧妙”的做法。当子应用 Proxy 的任意属性被访问时，它会自动的把全局的当前激活应用指向到子应用。


## **个人评价**


通过调研发现，Qiankun 的实现十分依赖于 import-html-entry。它会帮助 Qiankun 获取到子应用的资源清单以动态加载资源，并依赖其在运行时替换 window 的能力以实现沙盒机制。


Kuitos 在 Qiankun 的 [3.0 roadmap](https://github.com/umijs/qiankun/discussions/1378) 提到，他有在考虑在新版本中让 qiankun 接入 ShadowRealm API，并考虑到把沙箱功能单独抽出来。


我个人对于 Qiankun 目前所提供能力的还是很敬佩的，它基本完成了它所承诺的目标，Qiankun 提供的微前端"傻瓜"式解决方案在 onboarding 微前端技术的初期会更受欢迎。但由于一些不好跨越技术壁垒，这套方案目前做不到足够完备，有对于使用者来说会有一些填不完的坑。


对于一个项目管理十分完善的团队来说，我认为可以从 Qiankun 里借鉴一些实践，为自己的项目设计一个更合适的方案。

