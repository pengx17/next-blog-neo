
# From a normal user to a core contributor


I learned about [PKM](https://en.wikipedia.org/wiki/Personal_knowledge_management) tools like Roam Research and Obsidian from podcasts. The concept of using a wiki to manage personal notes seems quite promising. However, I did not find Obsidian attractive, and Roam Research was too expensive, so I did not start using either of them soon.


Later I learned [Logseq](https://logseq.com/) because of this tweet by @EGOIST, and started using it ever since.


[embed](https://twitter.com/poorlybatched/status/1367376801220026369)


The most attractive aspect of Logseq is that it is an [open-source project](https://github.com/logseq/logseq). Logseq was originally developed as a side project by [Tienson Qin](https://twitter.com/tiensonqin), who wanted to build a UI tool around [Org Mode](https://orgmode.org/). Since its release on GitHub as an open-source tool, it has gained a strong user community and many code contributors.


## My contributions to Logseq Repo


I nearly started contributing to Logseq as soon as I picked it up in March 2021. Until today I have 100 merged PRs (700+ commits, ranked #3).


![](/notion-images/4c36df32-2a70-4841-b9a5-a6feab6345d0.png)


My early contributions to Logseq were pretty trivial, like small UI tweaks, adding new codemirror modes, etc. As the code base is mainly written in ClojureScript which I have no experience in that at all, I haven’t put too much effort into the Logseq repo at the beginning.


## Logseq Hobbits


In mid-2021 the Logseq team was looking for contributors and would like to sponsor them to contribute to the Logseq project. This project is called “Logseq Hobbits”. I signed up and became the first hobbit.


[embed](https://twitter.com/bmann/status/1404842595214258185)


There were no restrictions on the theme for which part should be contributed, as long as it was related to Logseq. Initially, my focus was on helping Logseq develop plugins in the plugin marketplace. My plugins mainly aim to enhance the UX of Logseq and make it more user-friendly.


Here are some popular plugins and themes I built:

- Themes: [Dev Theme](https://github.com/pengx17/logseq-dev-theme) & [Block Bullet Threading](https://github.com/pengx17/logseq-plugin-bullet-threading)
- Plugins: [Journal Heatmap](https://github.com/pengx17/logseq-plugin-heatmap), [Tabs](https://github.com/pengx17/logseq-plugin-tabs), [Link Preview](https://github.com/pengx17/logseq-plugin-link-preview), [TODO Master](https://github.com/pengx17/logseq-plugin-todo-master)
- Plugin Template: [Logseq plugin React template](https://github.com/pengx17/logseq-plugin-template-react)

![](/notion-images/3d24b0f4-76bb-4334-a4a2-b4352096b15e.png)


I also developed a [Logseq Publish Action](https://github.com/pengx17/logseq-publish) that could automate Logseq graph publishing using a GitHub Action. Now there are quite a few graphs you can find online that are published by this action. You can check the detailed story about it in [this post](/8b98a35c440145639e73e0f90d4d7fcd).


### Logseq Whiteboard


In late 2022, Tienson asked me to integrate [Tldraw](https://beta.tldraw.com/) into Logseq. Initially, I thought the work was to integrate it in an embedded view, just like how Excalidraw works in Logseq. However, the goal was much more ambitious: the Logseq team wanted to have a **Whiteboard** feature powered by Tldraw.


The Logseq Whiteboard aims to make whiteboards a first-class citizen of Logseq, just like pages and blocks, and extend the boundary of Logseq's outliner and graph modes. Users can view the referenced whiteboards in page/block references, add whiteboard links to their blocks, and more.


The work was very challenging. For example, Logseq is a very large code base mainly written in Clojure/ClojureScript. Not only did I need to learn a new programming language, but I also had to figure out [the data workflow](https://whimsical.com/9sdt5j7MabK6DVrxgTZw25) between the Tldraw layer and the Logseq CLJS layer. Fortunately, the Logseq team members were super helpful, and I became a fan of the Clojure language during the journey.


In addition, the Whiteboard feature depended on a custom build of Tldraw to fit the needs of Logseq, which originated from an abandoned next branch from [the author of Tldraw](https://twitter.com/steveruizok). We had to add many missing features and fix a lot of bugs based on this unfinished work.


I spent nearly [6 months developing](https://github.com/logseq/logseq/pull/5341/commits) the Whiteboard feature with the Logseq team, mostly with [Jakob](https://twitter.com/DerScheinriese) and [Konstantinos](https://twitter.com/sprocket_c), and worked on it part-time after my daily full-time job. We worked together in different time zones, having weekly sync calls and discussing feature and UX designs as well as technical issues. I really enjoyed the time working on this project.


Our work gained a lot of attention on [Twitter](https://twitter.com/pengx17/status/1552172906146398208)! It was really exciting to see that our work was valued by a broader audience, which was not the case in my full-time job.


![](/notion-images/d9f7cc46-fe0d-4c85-9fe8-797bbe898568.png)


Logseq right now is out of MVP, but is still in beta, which means only [Open Collective](https://opencollective.com/logseq) sponsors could use this feature. You can check the introductory video at [https://www.youtube.com/watch?v=hz2BacySDXE&t=1s](https://www.youtube.com/watch?v=hz2BacySDXE&t=1s).


# At last


I resigned from my position as a Logseq Hobbit at the end of 2022 due to changes in my career. It was difficult to leave the project, as I felt sorry that I would not be able to contribute further.


Being a Logseq Hobbit was a valuable experience for me. Not only did I have the opportunity to work remotely on a PKM tool with an awesome team, but it also made me rethink my career goals.


I had the pleasure of meeting many interesting and talented people in the contributor/user community, which led me to become more active in open-source over the last year. Logseq is an amazing project, and it was an honor for me to contribute to it.


Thank you for reading!

