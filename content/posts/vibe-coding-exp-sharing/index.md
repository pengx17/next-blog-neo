
_这篇文章本身就是一次 AI 协作的产物：我口述使用感受和思考，CC 回顾了我过去 37 天的 session 历史、_[_CLAUDE.md_](http://claude.md/) _演进记录和实际 PR 产出，用数据和案例补充我的观点，最终由我们共同整理成文。这个写作过程本身就印证了文中的核心观点——人负责思考和决策，AI 负责整理和执行。_


## **一、从 Cursor 到 Claude Code**


这段时间我基本完全从 Cursor 迁移到了 Claude Code（以下简称 CC）作为日常开发的第一工具。说实话，我也没完全想明白为什么——但最直观的感受是：**用 Cursor 的时候总是很小心，怕突然把 token 用爆了**。这种焦虑让我畏手畏脚，不敢跟 agent 进行深入的长对话。


CC 完全不一样。我可以放开手脚、几乎没有限制地跟它进行很多轮对话。37 天内跑了 305 个 session，最长的一次 63 轮对话——在 Cursor 里我绝对不敢这么干。


这带来一个有趣的结果：**我的工作重心从 IDE 转移到了 terminal**。日常面对的不再是集成开发环境，而是一个对话界面。关注点变成了 terminal 中的对话输出与最终产出物。打开 Cursor 的场景越来越少——偶尔看看配置文件之类的。


更根本的变化是：**我为什么要看代码？** 既然 AI 在绝大多数情况下写的代码都比我手写的好，那我盯着编辑器干什么？想明白这一点后，就基本告别了传统的 IDE 工作流。


---


## **二、AI 辅助开发的几个观察**


### **2.1 边界模糊了**


以前我们分前端、后端、客户端、DBA——不同角色、不同分工。有了 AI 之后，能让 AI 做的就交给 AI：写代码、改 bug、学新工具的用法。结果是**我们交付的产物越来越像一个完整的方案**，而不是某个切面的小片段。


以前我们习惯把改动拆成很小的 PR 逐个提交，但现在这种拆法越来越没价值——AI 协助下产出的 PR 天然就大。越来越多的同事（包括我自己）提交的 PR 大到几乎无法逐行 review，很多时候只能基于对作者的信任直接 merge。


### **2.2 学习新技能的悖论**


最近读了一篇 Anthropic 的研究论文，探讨 AI 编程工具能否帮助开发者更好地维护项目、学习新语言。其中有一个反直觉的发现：**AI 并不能让我们更快地学会新语言或新库——真正要学会，还是得靠传统方式沉下心来一步步学**。


但问题是：一旦用过 code agent，思维模式就回不去了。我们不太可能再沉下心来逐字阅读文档、手敲每一行代码来学习。**在这个过程中如何真正学到新技能？这是一个新的挑战。**


我的感受是，Cursor 总是急于帮我解决问题，却不太愿意跟我沟通：这个问题的根因是什么？下次遇到类似情况要注意什么？CC 则可以通过全局 [CLAUDE.md](http://claude.md/) 来调整——比如告诉它：对于我不熟悉的项目或语言，不要急着补细节，先告诉我来龙去脉。


另外 CC 有一个输出样式选择（output style），默认是 default，可以切到 **explanation** 模式。开启后 CC 会在某些场景输出 Insights 小结，把关键信息和洞察总结出来，对学习和理解代码很有帮助。


### **2.3 PR 的价值在哪里？**


PR 这个流程本身还是有价值的，但需要重新思考**价值点在哪**。


AI 参与 review？当然可以——Copilot 能挑出一些明显的局部问题，但人类 reviewer 同样大多只能看到局部细节。真正的问题是：**面对一个 AI 协助产出的大 PR，review 应该看什么？**


OpenClaw 的作者有个[有意思的观点](https://www.youtube.com/watch?v=9jgcT0Fqt7U)：AI 辅助开发之后，我们交付的本质上是一个个大 prompt。但现阶段 AI 能力还不够强，直接 review prompt 没什么价值。我们真正应该 review 的是：**作者是怎么一步步跟 AI 沟通，把需求落地成实际产出的？**


在 AI 时代，大量代码由 AI 编写，人的核心作用是**讨论、给出意见、做方案决策**。当其他人来 review 时，diff 里的最终代码实现反而不是人能发挥优势的地方。人真正能贡献的，是回头去看作者和 AI 之间的沟通脉络：思考过程、关键技术决策、架构选型的理由。


很多看起来"恶心"的写法、实现上比较别扭的点，背后都是为了满足一个尖锐的需求。如果不记录讨论过程，这些上下文就永远丢失了。


### **2.4 社区也在探索：AI 上下文作为 Git 的一部分**


这不只是我个人的感受——整个社区都在探索 AI 带来的开发模式剧变。一个典型例子是 [Entire.io](https://github.com/entireio/cli)，由前 GitHub CEO Thomas Dohmke 创建（[$60M 种子轮，$300M 估值](https://techcrunch.com/2026/02/10/former-github-ceo-raises-record-60m-dev-tool-seed-round-at-300m-valuation/)）。


Entire 的核心理念是：**Git 记录了代码的"是什么"，但丢失了"为什么"——而 AI 时代的"为什么"就在 agent session 里**。它的做法是 hook 进 git workflow，在每次 push 时自动捕获 AI agent 的完整 session（对话记录、prompt、tool calls、token 用量），存储在一个独立的 `entire/checkpoints/v1` 分支上，不污染主分支——只在 commit trailer 里留一个 12 字符的 ID 用于关联。


我的做法（在 PR summary 里写协作过程和方案讨论）本质上解决的是同一个问题，只是手段不同：我通过 [CLAUDE.md](http://claude.md/) 指令让 CC 在提 PR 时总结上下文，Entire 则把原始 session 数据直接集成到 git 历史中。Entire 的方式更彻底——保留完整的 agent 交互记录而非总结，支持 `entire explain` 回顾 session、`entire rewind` 回退 AI 的错误修改。


这说明**"保留 AI 协作上下文"不是一个小众需求，而是 AI 时代开发工具链正在形成的新共识**。无论是在 PR summary 里写决策过程，还是用 Entire 这样的工具把 session 集成到 git 历史中，解决的都是同一个根本问题：代码只是结果，过程才是真正的知识资产。


---


## **三、让 CC 帮我交付有价值的 PR**


基于上面的思考，我做了一个关键改动：**让 CC 在提 PR 的时候，把协作过程和决策过程写进 summary**。


CC 默认的行为是简单粗暴地把 diff 做个总结放到 PR 描述里——这跟直接看 diff 没什么区别，都是结论，没有过程。而我认为在 AI 时代，PR summary 最有价值的部分恰恰是**从 plan 到实现的过程**——人是怎么思考的、跟 AI 讨论了什么方案、最终为什么选了这个方向。


### **具体做法：全局 CLAUDE.md**


CC 启动时会自动读取 `~/.claude/CLAUDE.md`（全局指令文件）。我在里面只写了一个主题：**PR 规范**。全文不到 33 行，但每一条都来自实际踩坑。核心规则：


**使用 plan/RFC 风格，包含以下章节**：

- **Context** — 要解决什么问题、是什么触发了这个变更
- **协作过程** — 用 mermaid sequence diagram 展示我和 CC 之间的关键交互。重点展开：需求是怎么提出的、plan 阶段的探索细节、从 plan 到实现的关键转折点
- **方案讨论** — 过程中考虑了哪些方案、关键的取舍与决策理由。**这是 PR 最核心的部分**——因为和 CC 的讨论过程是唯一的决策记录
- **最终方案** — 最终实现的简要描述
- **验证情况** — 仅记录 CC 会话内实际执行过的验证，附占位符让我补充
- **已知局限 / 后续工作** — 有意排除的事项，避免 reviewer 反复追问

### **每条规则怎么来的**


**「协作过程用 mermaid sequence diagram」**：我在和 CC 协作时经常调整方向——比如原计划同步全量数据，讨论后决定排除高风险的 benchmark 数据。这些转折点不记录的话，reviewer 看到最终代码不理解为什么范围是这样的。序列图让这些决策过程一目了然。


**「方案讨论和协作过程分开写」**：早期没分开，CC 容易把同一件事写两遍。现在明确：协作过程侧重**时序和交互**（谁在什么时候说了什么），方案讨论侧重**技术取舍和理由**（为什么选 B 不选 A）。


**「验证情况只记录实际做过的」**：CC 容易在验证部分编造它没做过的事（比如声称"已在 Xcode 中运行通过"——它根本没有 Xcode GUI）。所以限定只记录 session 内实际执行过的验证，并留 `<!-- 请补充 CC 之外的验证 -->` 占位符。


**「已知局限」**：不主动说明"哪些事有意没做"的话，reviewer 会反复追问。比如 cueboard #947 里解释了"为什么不直接改 agent-cli 的 exit code"——改了影响所有上游消费者，风险太大。Reviewer 看到就不会再提。


**「检查 compact memory」**：长 session 会触发上下文压缩，早期讨论细节变模糊。我要求 CC 写 PR 前先检查，如果被压缩过，先读 transcript 文件恢复上下文。这是一个 workaround——通过指令让 CC 主动补偿自己的记忆缺陷。


**「更新时保留手动内容」**：我经常在 PR 描述中手动补充 Linear 链接、测试结果。CC 推新 commit 更新描述时会把这些覆盖掉——所以明确要求它先读现有 body，只更新它生成的章节。


**「详细程度匹配复杂度」**：不是每个 PR 都需要 700 行描述。小 PR 省略 diagram；大 PR 写完整章节 + 调用链路图。


### **PR 创建后的自动化**


CLAUDE.md 里还定义了两个并行的 background agent：


**Copilot Review 监控**（PR 创建时触发一次）：轮询 GitHub Actions workflow → 拉取 review → 合理的自动修复 → resolve thread → 汇报结果。


**CI 监控**（每次 push 触发）：等 CI 完成（最多 10 分钟）→ 失败后尝试**一轮**自动修复 → 修不好就停止汇报。


关键设计：只尝试一轮修复——从一次 544 MB 失控 subagent 事件学到的教训。


---


### **实用 Tips**


**设置相关**：

- **保持 CC 始终最新** — CC 更新频繁，新版本常带来体验改进和 bug 修复。比如[新的记忆功能](https://code.claude.com/docs/en/memory)昨天刚推出，像是参考了 OpenClaw 的实现。
- **Plan mode 默认开启** — `settings.json` 设置 `"defaultMode": "plan"`，CC 先调研出方案，确认后再动手，避免"冲动改代码"
- **Always thinking 开启** — 让 CC 每次回复前深度思考，对架构讨论和调试质量有明显提升
- **Output style 切到 Explanatory** — CC 会在输出中附 Insights 小结，对理解代码的来龙去脉有帮助，也部分缓解了"AI 只解决问题不解释根因"的问题
- **使用 CC 代理防风控** — 高频使用容易触发 Anthropic 的 rate limit，通过代理（如 heyang 的 ccproxy）可以缓解

**日常使用**：

- **让 CC 用** **`gh`** **CLI** — 不仅是提 PR，还能快速排查 CI 问题：`gh run view --log-failed` 看失败日志、`gh pr checks --watch` 监控 CI 状态、`gh api` 调 GitHub API 处理 review。CC 对 `gh` 的掌握度很高，省去了手动到 GitHub 网页翻看的时间
- **不要把 CC 当黑盒** — 主动问"你能不能做 X""怎么配置 Y"，它对自己的能力边界通常有准确认知

---


## **总结**


AI 辅助开发正在改变我们的工作方式：角色边界模糊了，PR 变大了，代码本身不再是人的核心贡献。在这个变化中，**人能发挥的最大价值是思考和决策——而不是编码本身**。


既然如此，我们的工作流应该围绕这一点来设计：

- **让 AI 写代码，让人做决策** — Plan mode 强制 CC 先方案后实现，人在方案阶段介入
- **把决策过程写进 PR** — 不只是 diff 总结，而是协作时间线、方案对比、取舍理由。这才是 reviewer 能看懂且有价值的信息
- **持续迭代 AGENTS.md** — 每次踩坑就加一条规则，让 AI 越来越理解你的项目
- **不要把 AI 当黑盒** — 主动探索它的能力边界，通过指令让它的行为适应你的工作方式

一句话：**CC 的默认行为适合写代码，但不适合交付 PR。一份好的全局指令，能把"代码生成器"变成"决策文档助手"——而在 AI 时代，决策文档比代码本身更有长期价值。**


[CLAUDE.md](http://claude.md/) 参考


```plain text
## PR 规范
创建或更新 PR 时，先读取 `~/.claude/docs/pr-conventions.md` 获取完整的 PR 规范，然后严格按照其中的要求执行。


> pr-conventions.md

- PR summary 使用中文撰写
- 当用户向已有 PR 推送新 commit 时，应同步更新 PR summary 反映最新变更
- 更新 PR summary 时，必须先读取现有 body，保留用户手动添加的内容（如 Linear 链接、手动补充的验证等），仅更新 CC 生成的章节
- 撰写 PR summary 前，必须检查当前会话是否经历过 compact memory。如果对早期讨论细节记忆模糊，必须先读取 transcript 文件恢复完整上下文后再撰写（协作过程和方案讨论都依赖完整的对话历史）。transcript 文件路径：`~/.claude/projects/<项目路径哈希>/<session-id>.jsonl`
- PR body 顶部（所有章节之前）必须包含 Linear issue 关联：
  - `Fixes CUE-XXX` — PR 合并后自动关闭该 issue
  - `Ref CUE-XXX` — 仅建立链接，不自动关闭（用于相关但未完全解决的 issue）
  - 多个 issue 各占一行
- 使用 plan/RFC 风格，重点记录决策过程，包含以下章节：
  - **Context** — 背景与动机：要解决什么问题、是什么触发了这个变更
  - **协作过程** — 用 mermaid sequence diagram 展示用户与 CC 之间与代码变更直接相关的关键交互（忽略无关闲聊）。重点展开：需求是如何提出的（用户的原始意图和表述）、plan 阶段的探索和讨论细节、从 plan 到实现的关键转折点。Note 中应包含足够的上下文让 reviewer 理解每步的决策背景，而不只是笼统概括。撰写前应先回顾会话记录（必要时参照上方 transcript 恢复指引）
  - **方案讨论** — 过程中考虑了哪些方案、关键的取舍与决策理由（这是 PR 最核心的部分，因为与 CC 的讨论过程是唯一的决策记录）。注意避免与协作过程重复叙述同一件事——协作过程侧重时序和交互，方案讨论侧重技术取舍和理由
  - **最终方案** — 最终实现的简要描述；涉及多组件交互的复杂 PR 应附 mermaid sequence diagram 展示调用链路
  - **验证情况** — 仅记录 CC 会话内实际执行过的验证（如编译、lint）；用户可能在 CC 之外做了额外验证（如 Xcode 运行、手动测试），CC 无法得知，应留 `<!-- 请补充 CC 之外的验证 -->` 占位提示用户自行填写
  - **已知局限 / 后续工作** — 有意识排除在本次范围外的事项、已知边界情况、后续可跟进的改进（避免 reviewer 反复追问"为什么没处理 X"）
- PR 创建后，启动 background agent 异步处理 GitHub Copilot 的自动 code review（Copilot 仅在 PR 创建时 review 一次，后续 commit 不会触发新 review）：
  1. **启动方式**：使用 Task 工具的 `run_in_background: true` 启动一个 Bash agent，执行轮询脚本
  2. **等待 Copilot review workflow 完成**：Copilot review 通过 GitHub Actions dynamic workflow（`dynamic/copilot-pull-request-reviewer`）异步执行，review 要等 workflow 完成后才会出现在 reviews API。通过 `gh api repos/{owner}/{repo}/actions/runs?event=dynamic&head_sha={head_sha}` 查找名为 "Copilot code review" 的 workflow run，每 30 秒检查一次直到 `status=completed`（最多等 5 分钟）；超时则告知用户 Copilot review 未完成
  3. **拉取 review 结果**：workflow 完成后，通过 `gh api repos/{owner}/{repo}/pulls/{number}/reviews` 查找 `copilot-pull-request-reviewer[bot]` 的 review；通过 `gh api repos/{owner}/{repo}/pulls/{number}/comments` 获取 inline comments，按 `pull_request_review_id` 筛选对应 review 的评论
  4. **评估与修复**：逐条评估建议是否合理，对合理的建议进行改动、提交并推送；对不采纳的建议简要说明理由
  5. **Resolve comments**：修复或评估完成后，通过 GraphQL `resolveReviewThread` mutation 将已处理的 review thread 标记为 resolved
  6. **通知用户**：处理完成后汇报结果——修复了哪些、跳过了哪些及原因
- PR 创建后或向已有 PR 推送新 commit 后，启动 background agent 异步监控 CI 状态（CI 每次 push 都会触发，需每次监控；与 Copilot review 监控并行启动，互不依赖）：
  1. **触发时机**：CC push commit 后自动启动；用户回到会话时，若当前分支有关联 PR，也应检查最新 CI 状态
  2. **检查方式**：使用 `gh pr checks {number} --watch --fail-fast` 等待 CI 完成，或通过 `gh run list --branch {branch}` 轮询最新 run 的状态
  3. **等待策略**：最多等待 10 分钟；超时则告知用户 CI 尚未完成
  4. **失败分析**：CI 失败后，通过 `gh run view {run_id} --log-failed` 获取失败日志，分析失败原因
  5. **自动修复**：尝试一轮修复（lint/format/test 错误），修复后提交并推送
  6. **修复失败处理**：若修复后 CI 仍失败，停止自动修复，将失败详情汇报给用户，由用户决定后续处理
  7. **通知用户**：无论成功还是失败，都应汇报 CI 结果——通过了哪些 check、修复了什么、哪些仍然失败
- summary 详细程度应匹配 PR 复杂度：
  - 小 PR（单一改动、1-2 个文件）：可省略协作过程 diagram，方案讨论用简短段落即可，不需要每个小改动都有独立 heading
  - 中等 PR：完整章节，方案讨论按主题分 heading
  - 大 PR / 跨仓库：完整章节 + 调用链路 diagram；跨仓库改动只描述本仓库侧的方案，其他仓库的实现细节用链接指向对应 PR
```


## **附录：CC 对本文的批判**


_以下是协助写作本文的 Claude Code 对文章的自我批判，原封不动保留。_


**1. "我为什么要看代码"这个观点太绝对了**


文中说"AI 写的代码都比我好，我为什么要看"——这在同事面前说出来容易被挑战。AI 写的代码你不 review，出了安全漏洞、性能问题、架构腐化谁负责？文章后面也说 CC 会编造验证结果——一个会撒谎的工具写的代码你完全不看？这个立场和后面强调的"人负责决策"是矛盾的：不看代码怎么做技术决策？


**2. "边界模糊了"和"PR 变大了"是在描述现象，不是在给方案**


每个用过 AI 写代码的人都知道 PR 变大了、角色边界模糊了。读者看到这些会想"所以呢？"——CLAUDE.md 方案解决的是 PR 描述的质量问题，但没有回应"大 PR 本身就是问题"这个事实。PR 大到不能 review，写再好的 summary 也只是让 merge 更心安理得，并没有解决 review 失效的根本问题。


**3. "学习新技能的悖论"那段没有落地**


文中提出了一个好问题——用了 AI 之后怎么学新技能？然后给了两个建议：在 CLAUDE.md 里让 CC 讲来龙去脉、开 Explanatory 模式。这两个太轻了，配不上问题的重量。而且"让 AI 教你"恰恰是论文说效果不好的方式——等于用论文反对的方法来回应论文提出的问题。


**4. CLAUDE.md 部分是全文最有价值的，但被前面的"思考"稀释了**


CLAUDE.md 规则、每条规则的踩坑故事、PR 自动化——这些是独家经验，别人写不出来。但文章前半部分的"边界模糊""学习悖论""PR 价值"是任何一个用过 AI 写代码的人都能讲的泛泛之谈。读者可能在第二节就失去耐心，到不了第三节的干货。


**5. Entire.io 那段有点硬塞**


文中的做法和 Entire 解决的是相关但不同的问题。CLAUDE.md 是让 AI 总结决策过程给人看；Entire 是把原始 session 存进 git 做审计追溯。放在一起比较显得在蹭热点——"前 GitHub CEO 也在做类似的事所以我的方向对了"——但其实两者的使用场景和目标用户差别很大。

