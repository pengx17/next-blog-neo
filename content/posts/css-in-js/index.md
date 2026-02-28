
HTML、JS、CSS 是 Web 开发的三大核心技术。Web 开发早期，开发人员的工作内容以编写可在浏览器渲染的页面文档为主，此时的最佳实践推崇 “关注点分离“ 原则，使得开发者可以在一个时间点只关注单一技术。通过声明式的语法，CSS 可以脱离 HTML 上下文进行独立维护，同时依赖于选择器、伪选择器、媒体查询等方式与 HTML 松耦合，最终将样式应用于 DOM 元素上。


随着以 React 为首的现代前端开发框架的兴起，在 JS 中维护 CSS 的方案（也就是 CSS-in-JS）成为了当代前端社区的新趋势，以解决在现代 Web 应用开发中使用 CSS 时出现的一些痛点。


为了解决这些痛点，FreeWheel 评估了大量新一代的 CSS 框架/工具/方案，并基于自身需求对 CSS-in-JS 方案进行了细致的选型。本文以我们的评估过程为线索，介绍了 CSS-in-JS 的背景、现状、开发特点和趋势。


---


# **传统 CSS 在 FreeWheel 转型 React 过程中的痛点**


FreeWheel 的前端从十年前的巨型单体 Rails 应用，发展到如今的前后端分离、基于 React 组件化的前端单页应用，在 CSS 的重构和开发方面先后遇到过不少痛点。其中最主要的还是 CSS 的组件化封装问题。


CSS 样式规则一旦生效，就会应用于全局， 这就导致分发缺少样式封装的 React 组件时有一定选择器冲突的风险。虽然 React 本身组件提供 `style` 属性，可以让用户以对象的方式以内联样式的方式，将样式应用于渲染后的 DOM 元素上，在一定程度上实现了样式的组件化封装。但内联样式缺少 CSS 所能提供的许多特性，比如伪选择器、动画与渐变、媒体选择器等，同时因为不支持预处理器，其浏览器兼容性也受到了限制。


举例来说，FreeWheel 的 Rails 应用曾大量使用了 jQuery 和 Bootstrap 框架，将前端逐步迁移到 React 时，迫于开发周期等因素需要保留一部分老代码，简单封装成 React 组件并与其他新编写的组件混用，这就导致其他组件的样式被 Bootstrap CSS 污染。当时我们利用 SCSS 将全局样式镶嵌到 bootstrap-scope 类中，再用 `<div class=“bootstrap-scope”></div>`将会产生 CSS 污染的老代码隔离起来。类似的例子还有不少，然而这类方案却并不具有普适性，引入了额外的维护成本。


## **相关替代方案**


对于 Angular 和 Vue 来说，这两个都有框架原生提供的 CSS 封装方案，比如 Vue 文件的 scoped style 标签和 Angular 组件的 `viewEncapsulation` 属性。React 本身的设计原则决定了其不会提供原生的 CSS 封装方案，或者说[CSS 封装并不是 React 框架本身的关注点](https://reactjs.org/docs/faq-styling.html#what-is-css-in-js)。因此 React 社区在很早的时候就在寻找着替代办法。其中有几种技术路线，分别是：

- CSS 模块化 （CSS Modules）：这种做法非常类似 Angular 与 Vue 对样式的封装方案，其核心是以 CSS 文件模块为单元，将模块内的选择器附上特殊的哈希字符串，以实现样式的局部作用域。对于大多数 React 项目来说，这种方案已经足够用了。
- 基于共识的人工维护的方法论，如 BEM。但这种方法对团队带来了很大的挑战，对于全局和局部规划选择器的命名，团队对于这种方法需要有共识，即使熟练使用的情况下，在使用中依然有着较高的思维负担和维护成本。
- Shadow DOM：借助[direflow.io](https://direflow.io/)等工具，我们可以将 React 组件输出为 Web Component，借助 Shadow DOM 实现组件的 CSS 样式封装。这是一种解决办法，不过一般来说很少项目选择这样做。
- CSS-in-JS，也就是本文的重点，接下来我们会围绕着它展开讨论。

# **CSS-in-JS 的出现与争议**


CSS-in-JS （后文简称为 CIJ）在 2014 年由 Facebook 的员工 [Vjeux 在 NationJS 会议](https://blog.vjeux.com/2014/javascript/react-css-in-js-nationjs.html)上提出：可以借用 JS 解决许多 CSS 本身的一些“缺陷”，比如全局作用域、死代码移除、生效顺序依赖于样式加载顺序、常量共享等等问题。


CIJ 的一大特点是它的[方案众多](https://github.com/MicheleBertoli/css-in-js)，这种看似混乱的状态很符合前端社区喜欢重复造轮子的特点。发展初期，社区在各个方向上探索着用 JS 开发和维护 CSS 的可能性。每隔一段时间，都会有新的语法方案或实现，尝试补充、增强或是修复已有实现。


随着时间流逝，他们中的大多数随着时间的发展，要么被官方宣布废弃，或是长时间不再维护。如：

- [glam](https://github.com/threepointone/glam)/[glamor](https://github.com/threepointone/glamor): 由 React 的前项目经理 Sunil Pai 维护，首先提出了 CSS 属性接口方案
- [glamorous](https://glamorous.rocks/) by PayPal
- [aphrodite](https://github.com/Khan/aphrodite) by Khan
- [radium](https://github.com/FormidableLabs/radium) by FormidableLabs

从 CIJ 概念的诞生到 6 年后的今天，社区对于它的看法依然充满了争议，并且热度不减。甚至 Chrome 在新版中为了 CIJ 的需求修复了[一个问题](https://developers.google.com/web/updates/2020/06/devtools)，可以从侧面看出来 CIJ 已经得到了浏览器厂商的重视。


争议集中在这几点：

- 使用 CIJ 是一种伪需求。假如开发者足够理解 CSS 的概念，如 specificity （特异性）、cascading （级联）等，同时利用预、后处理工具（如 scss/postcss）和方法论（如 BEM），只靠 CSS 就足够完成任务了
- CIJ 方案和工具过多，缺乏标准，许多处于不成熟的状态，使用起来有较大风险。假如使用了一个方案，就得承担起这种实现可能会被遗弃的风险
- CIJ 有运行时性能损耗

# **趋于融合的事实标准**


虽然 CIJ 还没有形成真正的标准，但在接口 API 设计、功能或是使用体验上，不同的实现方案越来越接近。列举两个最受欢迎的解决方案：[Emotion](http://emotion.sh/) 和 [styled-components](https://styled-components.com/)。通过几年间的竞争，为了满足开发者的需求，同时结合社区的使用反馈，在不断的更新过程中，它们渐渐具有了几乎相同的 API，只是在内部实现上有所不同。


![](/__NOTION_IMAGE__c1edef96-f076-42c2-b77a-69353c76e8b1__)


这种状态形成了 CIJ 在 API 接口上的事实标准。不管是现有的主流方案和新出现的方案，几乎在接口上使用同样的（或是一部分的）接口设计：**CSS prop** 与**样式组件**（styled components，与 styled-components 库名称相同）。以 Emotion 为例：


### **css prop**


![](/__NOTION_IMAGE__e42d2d00-1553-454a-b64c-2b1b59e2a7f1__)


### **样式组件**


![](/__NOTION_IMAGE__611eb304-4915-40f8-8c23-9c201947b143__)


同时，这两种方案都支持模板字符串或是对象样式


![](/__NOTION_IMAGE__7c4fd424-7520-4732-8165-1b862ae2d7dd__)


两种方案在内部实现中都会享受当代前端工程化的福利，如语法检查、自动增加浏览器属性前缀、帮助开发者增强样式的浏览器兼容性等等。同时利用 [vscode-styled-components](https://marketplace.visualstudio.com/items?itemName=jpoissonnier.vscode-styled-components)、[stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) 等代码编辑器插件，我们可以在 JS 代码中增加对于 CSS 的语法高亮支持。


### **"css prop" vs "样式组件"**


这两种 CIJ 的 API 接口模式代表着两种组件化样式风格。


css prop 可以算是内联样式的升级版，用户定义的内联样式以 JSX 标签属性的方式与组件紧密结合，可以帮助用户快速迭代开发，让用户可以更快速的定位问题。不过由于样式直接内嵌在 JSX 中，势必在一定程度上会影响组件代码的可读性。


样式组件更像是 CSS 的组件化封装，将样式抽象为语义化的标签，把样式从组件实现中分离出来，让 JSX 结构更“干净整洁”。相对而言，样式组件定义的样式不如内联样式更方便直接，而且需要给额外多出来的样式组件定义新的标签名，多少影响了开发效率；但从另外一个角度，样式组件以更规范的接口提供给团队复用，适合有成熟确定的设计语言的组件库或是产品。


选择用哪一种方案并没有决定性方法论，可根据项目需要进行取舍。


# **新趋势**


虽说由于马太效应，CIJ 的市场份额被 styled-components 和 Emotion 吃掉了一大部分，但社区依然有新的实现不断涌现，探索新的 CIJ 方向，或是解决先前技术的不足。


## **移除运行时性能损耗**


在框架内部，Emotion 和 styled-components 在浏览器中都有一个运行时，这不光增加了最终构建产物大小，更严重的问题是还带了运行时成本。 举例子，CSS 属性的实现思路是这样的：

- 解析用户样式，在需要时添加前缀，并将其放入 CSS 类中
- 生成哈希类名
- 利用 [CSSOM](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model)，创建或更新样式
- 生成新样式时更新 css 节点/规则

对于大型前端项目来说，CIJ 的运行时损耗有时是可以感知到的，这会对用户体验造成一些影响。有些新方案选择将 CSS 在构建时输出为静态 CSS 文件，如 [Linaria](https://github.com/callstack/linaria)。不过这种方案有一些语法上的限制，比如[不支持内联 CSS 样式](https://github.com/callstack/linaria/blob/master/docs/DYNAMIC_STYLES.md)。


值得一提的是 [@compiled/css-in-js](https://github.com/atlassian-labs/compiled-css-in-js), 这个库会用类似于 Angular 的预先（AoT）编译器，将组件样式预先编译为 CSS 字符串，嵌入转译的 JS 代码中。这种方式显著减少了因变量引起的 CSS 冗余问题。


![](/__NOTION_IMAGE__cc57dd50-24a9-4801-954a-66df63b7e108__)


## **原子化**


以 [Tailwind CSS](https://tailwindcss.com/) 为代表，CSS 原子化是使用纯 CSS 的一种流行方案。这种方案中，用户使用库提供的功能性 CSS 类修饰 DOM 结构。下面是一个使用 Tailwind 的例子：


`<button class="bg-blue-500 hover:bg-blue-700 rounded">  Button</button>`


其中 `bg-blue-500` `hover:bg-blue-700` `rounded` 是 Tailwind 预定义的原子 CSS 类，每个类里面只有一条唯一的样式规则。使用原子化 CSS 有一些好处，比如：减少 CSS 规则冲突可能性（Specificity）；CSS 的大小恒定，不会跟随项目的增长而增长；用户可以直接修改 HTML 属性而不用修改 CSS，改变最终渲染的效果 。 不过要使用原子化 CSS，用户要么需要自己生成一系列原子化的功能性类（工程化成本），要么需要引入 Tailwind 方案（学习成本）。CIJ 给 CSS 原子化带来了一些新的可能性，社区正在探索利用 CIJ 完成自动化的原子化 CSS 的可能性，比如 [Styletron](https://www.styletron.org/)、[Fela](https://github.com/robinweser/fela)、[Otion](https://github.com/kripod/otion) 等。


原子化 CSS 可能会给 CIJ 带来不少好处，比如 CSS 规则去重。CIJ 在运行时会产生许多新的 CSS 类，增加浏览器的负担。遗憾的是这需要框架本身支持把 CSS 抽离为静态文件的需求。目前流行的 CSS-in-JS 框架，比如 Emotion，暂时还无法支持这样的特性。


---


# **结语**


为解决传统 CSS 在现代前端应用开发中遇到的痛点，经过了一段时间的探索与实践，FreeWheel 最终确定了以 Emotion 作为目前的 CIJ 方案，将其应用于部分前端项目。Emotion 社区活跃度很高，在可以预见的未来之中，它依然会保持相当长时间的流行度。并且现在多数 CIJ 方案出现了接口方案收敛融合的趋势，假如将来我们需要切换方案的时候，我们有很大把握可以比较顺滑的切换到新的方案上。FreeWheel 依然会持续关注社区动态，在必要的时候进行调整。


跟所有技术方案一样，CIJ 同样不是一颗能完美解决样式维护上的银弹。但借助一定最佳实践后，Emotion 足以应对 FreeWheel 的大多数前端需求，比如消费设计令牌、主题切换、组件样式封装、用户端样式覆盖等等，并显著提升了前端团队在维护样式时的幸福感。


希望此文会对你有所帮助！

