
## **前言**


作为 Web 前端开发人员，我们日常使用任意一个前端 UI 库时，我们希望它的组件文档页面有提供在线编辑功能的交互式演示，帮助业务团队更直观的理解组件库的使用方法。


在 FreeWheel，UI 开发都会使用前端架构团队开发的一个闭源 React 组件库，也被称为 Spark UI，同时为便于业务团队日常开发参考，我们还在公司内部私有网络中维护着组件库文档的展示网站 (背后技术为 Next.js)。


与其他的 UI 文档类网站类似，Spark UI 的每个组件的文档页面以 MDX 文件的方式维护。为了让业务团队可以方便的试用组件，每个组件文档页面都嵌入了一个或多个有在线编辑功能的 playground。


流行的解决方案，如 CodeSandbox、React Live 等，都或多或少有一些痛点导致不能完全符合我们的需求。


### **我们的需求如下:**

- 支持使用**闭源组件库**。由于 FreeWheel 内部使用的前端基础组件库没有发布到 npmjs.org，因此不能直接使用 CodeSandbox 等依赖于 npmjs.org 的服务。
- **多文件**在线编辑。由于有的代码示例可能会很长，为了保证阅读体验，我们希望能把内容分割到不同文件中。
- **CSS Module** 支持。FreeWheel 内部 UI 大多数还是以 CSS Module 方式管理样式，示例代码同样如此。
- **纯静态**部署，支持离线访问。静态部署可以显著降低部署和维护成本。

最终，我们选择借助 esbuild 等开源库，实现了一套 FreeWheel 自研的解决方案，它能比较好的覆盖上述需求。这套方案已经为 FreeWheel 的 UI 文档页面服务了几个月的时间，并且得到了业务团队的认可。


我们认为此方案不光应用于 FreeWheel 的场景。同时为了回馈社区，因此在最近正式以 **Code Kitchen 的名称在 GitHub 开源**。你可以在此找到项目的代码仓库 [https://github.com/freewheel/code-kitchen](https://pengx17.vercel.app/posts/code-kitchen-intro)。


接下来，此文会聊一聊 Code Kitchen 诞生的故事。


## **寻找已有开源实现**


在打造 Code Kitchen 这个新“轮子”之前，我们也尝试过在开源社区里寻找能满足我们的方案。我们首先调研了几个流行的 React 库的文档网站，看一看有哪些可以符合我们的需求。


在调研过程中，社区中的很多方案启发了 Code Kitchen 的设计。我选取了下面三个例子作为参考：


### **新 React 文档**


[新的 React 文档](https://beta.reactjs.org/) 基于 Next.js 技术栈重写，由来 React 团队与 Next.js 、CodeSandbox 社区成员共同开发，目前处于 beta 测试阶段。


它的代码 playground 由 Sandpack 驱动。[Sandpack](https://codesandbox.io/post/sandpack-announcement) 是 CodeSandbox 公司在 2021 年底开源的浏览器内的打包工具。借助它，开发者可以为自己的网站定制一个可以实时运行代码的 CodeSandbox。


更有意思的是，我们从新 React 文档中学习了**如何在 MDX 中组织多文件演示 playground**，示例如下：


![](/notion-images/08f33007-03a7-433a-9ec3-839a79656f07.png)


在上面的例子中，`<Sandpack />` 是一个自定义的 Sandpack 组件。

- 解析嵌入的代码块并将它们作为虚拟文件使用
- 将解析好的文件传入 Sandpack，以初始化 playground

熟悉 MD 语法的读者可得知，我们可以通过给代码块增加语言缩写（如`js`, `css`），让常见的 MD 应用为其激活代码高亮。进一步的，我们还可以在语言后面增加自定义后缀，比如为代码块增加文件名。


假定所有文件处于一个虚拟的文件目录下，那么文件模块之间可以通过如 `import './styles.css'` 的方式以相对路径进行访问。同时，假设我们把第一个文件看做虚拟文件的入口，就得到了一个标准的 ESM 模块树。


用上面的思路，我们就可以在 MD 中为一个代码示例提供多文件支持，让 playground 有类似于 IDE 般的体验。


### **Sandpack 的问题**


一开始，我们认为参考 React Docs 使用 Sandpack 是一个可行的解决方案。 但经过调研，Sandpack 外部依赖的处理方式让我们放弃了这套方案。


Sandpack 的打包器 (bundler) 工作于一个指向到 URL 为 `*.codesandbox.io` 的 iframe ，并在这个域名所在的远程服务解析 react 和 react-dom 等外部依赖项。不过，这个服务仅提供可以在 npmjs.org 中找到的公共包。


对于我们的用法，我们需要为 UI 组件的 playground 导入来自于私有 registry 的 npm 包。Sandpack 给出了一个[定制 bundler 服务器导入私有包](https://github.com/codesandbox/sandpack/discussions/58)的解决方案，但我们之后意识到我们真正需要的不是导入远程私有包，而是直接在 playground 里使用内部依赖源代码，这样可以降低本地开发时的版本管理难度。


此外，Sandpack 的打包器和组件预览运行于一个指向到远程服务的 iframe 内执行。如果需要自己定制这个远程服务，就会增加更多的人力成本、消耗额外的计算资源。如果可能的话，我们希望能找到一个纯静态的解决方案。


### **Semi DesignH3**


[Semi Design](https://semi.design/en-US/) 是字节跳动最近开源的一个 React UI 库。 演示代码 playground 在视觉上很好地集成在了组件页面里:


![](/__NOTION_IMAGE__b5c7e4ec-9a31-4637-8b52-ac4f3718e961__)


Semi Design 组件展示页的 playground 实时编辑性能十分优秀，代码编辑和组件的预览在体验上几乎可以保持同步。 它没有使用 CodeSandbox 等基于 iframe 的技术方案，而是使用了另一个受社区欢迎的库：[React Live](https://github.com/FormidableLabs/react-live)。下面是它的一些技术细节：

- React Live 使用当前上下文的 React 引用渲染预览组件；
- 当用户更改示例代码时，React Live 会使用 Bublé 为新的代码在浏览器内进行转译，尤其是需要将 JSX 代码转换为纯 JS 代码；
- 之后，将转换后的代码包装到 new Function 中，同时提供运行时上下文；
- 最后，调用上一步得到的函数，就可以得到更新后的 React element，示例的预览窗口组件就可以把最新的示例代码重绘到预览面板了。

React Live 的工作方式非常灵活且轻量。 最吸引我们的地方是，利用它传递运行上下文的能力，渲染 demo 组件预览时可以直接使用打包好的私有组件源码，而不用在运行时去远程仓库动态获取相关库文件。


不过，由于 React Live 缺少处理多文件的能力，这是我们最终没有使用 React Live 的原因。


### **Fluent UI React**


[Fluent UI React](https://developer.microsoft.com/en-us/fluentui#/controls/web) 是由微软开发的 React UI 库。Fluent UI 的组件展示页内置了一套类似于 React Live 的技术方案。我们发现它同时还为代码编辑器做了功能增强，让开发者能够在编辑代码的同时，直接查看相关代码的类型信息。


Fluent UI 的语法提示功能实际上实现起来并不复杂，在运行时向 monaco-editor 的 TS language server 载入相关库的 d.ts 文件就可以了。为了实现 d.ts 载入功能，我们需要在文档网站打包的时候，可能也把需要的 d.ts 文件也打包进去，或者用 Ajax 的形式动态获取远程的类型文件。


不过，这套方案的问题与 React Live 一样，它也不支持多文件处理。


![](/__NOTION_IMAGE__00087049-c635-46b2-a295-608bfd55eaae__)


## **开发我们自己的轮子**


在调查了现有的开源解决方案之后，我们决定收集了各方长处，实现一个可以满足我们自己使用场景的方案。


### **目标需求**


1. 支持使用**闭源组件库**
2. **多文件**在线编辑
3. 支持 **CSS Module**
4. 与 **MDX** 有良好的兼容性
5. **纯静态**方案
6. 有**类型提示**功能的编辑器


### **目标剖析**


React Live 可以支持目标 1、4、5，已经非常接近我们的目标需求了，我们可以参考其中的其中一部分实现逻辑。对于目标 6，我们可以参考 Fluent UI 的做法，使用 monaco-editor 作为代码编辑器核心。


剩下的问题（目标 2、3），我们需要解决如何在浏览器内打包多文件，并支持 CSS Module 类型的 CSS 文件。


看起来也许我们可以使用 babel 动态转译单个文件，然后把它们拼在一起，就能达成我们的目标。但实际上，打包本身没这么简单 -- 我们需要额外考虑外部依赖、ESM 模块 export/import，以及如何处理、编译 CSS/JSON 等类型的文件。


### **解决问题的核心: esbuild-wasm**


几个月前，我发现了一个由 esbuild-wasm 实现的 [esbuild playground](https://esbuild.egoist.sh/)。指定入口文件后，利用 ESM 的依赖关系，就可以将多个文件打包。esbuild-wasm 是流行的 ES 高速构建工具 [esbuild 的 WASM 版本](https://esbuild.github.io/getting-started)。利用它，我们就可以在浏览器中使用 esbuild。


这个项目启发了我们：可以使用 esbuild 处理 playground 中多文件打包，并使用 esbuild 的插件系统处理不同的文件类型（如 CSS Module）。我们按照这个思路最终实现了 Code Kitchen 的打包器核心。


### **Code Kitchen 工作流**


Code Kitchen 的简易工作流与 React Live 类似：

- 首先，将 MDX 中解析好的文件放置到多标签页模式下的 monaco-editor 中。
- 当首次渲染、或用户修改代码后，新的代码会被 esbuild-wasm 打包，生成为 CJS 的字符串。后面我们会详细聊一下这部分的工作原理。
- 之后，我们可以用 `eval` 执行打包好的文件，最后将 React 组件渲染到预览视图中。

![](/__NOTION_IMAGE__9b9980b1-0e71-4a68-9ddb-90a58f63e6e9__)


接下来，我们会简单说明一下 code kitchen 使用 esbuild-wasm 的一些工作细节。


### **文件打包与外部依赖处理**


每个 Playground 文件由以下接口表示。


`export interface InputFile {  filename: string;  code: string;}`


一个 Code Kitchen 的输入可能会有一个或者多个文件。默认情况下，我们会以第一个文件作为入口文件。对于 Code Kitchen 来说，它的入口文件需要是一个 jsx/tsx ESM 模块，并且它的 `default export` 需要是一个合法的 React 函数组件。


打包过程中，esbuild 会遍历模块树，并解析所有的导入路径。 导入的路径可能有两种：

- **相对路径**：如果一个文件路径以 `./` 开头，那么我们认为这个文件可以在 Code Kitchen 的文件列表参数中找到。这些文件会被转译并打包到最终结果内。
- **外部标识符**：任何除了相对路径的模块导入都被识别为外部依赖项目，比如 React、Spark UI (FreeWheel 内部的 React 组件库) 等。外部模块导入项会以 CJS 模式转译为 `require("react")` 的形式存在于打包结果中。

打包后的内容实际上是一个完整的 JS 字符串。我们会将其包裹到 `new Function` 中，然后以下面的形式替代模块中的 `require` 函数：


`(function (require) {  // bundled js script ...})(myCustomRequire);`


假定你需要 `react` 与 `my-private-lib`，那么就可以这样定义你自己的 `require`，为运行时提供外部依赖:


`import * as React from "react";import * as privateLib from "my-private-lib";const dependencies = {  react: React,  "my-private-lib": privateLib,};const require = (key: string) => {  const res = (dependencies as any)[key];  if (res) {    return res;  }  throw new Error("DEP: " + key + " not found");};`


### **全局 CSS、Scoped CSS 与 CSS Module**


在 Code Kitchen 中，我们有三种处理 CSS 的规则。默认情况下，CSS 文件中定义的规则仅在当前组件的预览内生效。同时，我们支持用户以 `.global.css` 或是 `.module.css` 后缀修饰 CSS 文件，分别指定全局生效的 CSS，或是使用 CSS Module。


对于每一种模式，我们都使用了类似于 [Webpack style-loader](https://webpack.js.org/loaders/style-loader) 的方式，将 CSS 通过 [Stylis](https://stylis.js.org/) 库转译，然后转成 JS 语句放入打包结果中。这样在打包的脚本执行时，将自动把 CSS 作为 style 标签插入到 DOM 树中。


由于 [esbuild 目前还没有支持 CSS Module](https://github.com/evanw/esbuild/issues/20)，并且市面上也没有找到能在浏览器中运行的替代库，因此我们借助 Stylis 解析 CSS AST 的能力实现了一种适合于 playground 的 CSS Module 标准的一个子集。


## **结语**


以上是 FreeWheel 开发 Code Kitchen 的主要背景。


Code Kitchen 已于不久前在 [GitHub 开源](https://github.com/freewheel/code-kitchen)。我们认为，这套方案可能是**目前最廉价的实现多文件、支持私有库的离线 React playground 方案**。


如果正在阅读这篇文章的你也有类似需求，欢迎你来使用它，并在 GitHub 上提供你的看法或者反馈使用上遇到的问题。未来，我们会考虑给它增加如下功能：

- 增加类似于 React Live 的模块化支持，让用户自己组合相关功能，定制 Playground
- 目前 Code Kitchen 与 React 框架绑定。我们会持续探索如 Vue/Angular 等其他框架结合的可能性。
- 体积优化。由于 Code Kitchen 核心依赖于 esbuild-wasm，本身体积较大（经过压缩后依然有 2.5M），与 React Live 这样的方案相比不够轻量。

感谢阅读！

