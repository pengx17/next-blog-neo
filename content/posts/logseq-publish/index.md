
A few months ago, I released a GitHub Action for automatically publishing Logseq graphs. You can find it at [http://github.com/pengx17/logseq-publish](http://github.com/pengx17/logseq-publish). Shortly thereafter, I added some notes on how it works to my public knowledge graph, which you can view at [https://pengx17.github.io/knowledge-garden/#/page/logseq publish github action](https://pengx17.github.io/knowledge-garden/#/page/logseq%20publish%20github%20action).


I am copying the contents of the blog post for my own ego.


---


# **Background**


Logseq has an official tool to _generate a fast, SEO-friendly, and scalable website from your Logseq content_ at [logseq/publish](https://github.com/logseq/publish). The implementation is based on Next.js and that is why it is great for SEO, whereas the static HTML site exported by Logseq is a "traditional" SPA application that is not SEO-friendly.


However, it is still at a super early stage of development:

- user needs to do a lot of work to publish it
- the published version is very different from the one rendered by the Logseq App
- the maintainer has left Logseq team and it is no longer under development

As a community contributor but also a Logseq user, I would prefer to see the published Logseq graph looks closely to the one showing in the Logseq App. I don't mind if the published version does not support SEO. At least for now.


There are some good public knowledge gardens that are powered by Logseq already that you can find on the Web. To list a few:

- [https://zhanghanduo.com/](https://zhanghanduo.com/)
- [https://note.xuanwo.io/](https://note.xuanwo.io/)
- [Logseq's official document](https://logseq.github.io/)

Imagine a normal user who uses GitHub Repo to sync his Logseq graph and use **GitHub Pages** to host it. His repo git repo's folder may structure like this


```plain text
├── assets
├── draws
├── logseq
├── pages
└── www
```

- `logseq/asset/pages etc` contains the normal graph files
- `www` contains the public assets of the page, which are picked up by GitHub Pages

In a daily workflow, the user needs to follow the instructions on Logseq's official document to publish his graph


1. be on the Desktop App
2. take some notes (don't forget to mark related pages as public, or mark all pages as public)
3. remove the old `www` folder
4. click the three dots in the top-right of menu bar
5. click "export graph"
6. click "Export public pages" to `www`
7. commit the generated assets & push to GitHub
8. if GitHub Pages is configured correctly, the new pages will be deployed soon


The issue with this approach is that we can only export pages as a static website **manually**. If I published a page and then found there are some notes that need correction, he needs to go over the tedious steps again. 🤦


# **A failed attempt on Logseq Publish CLI**


People in the [Logseq Discord channel](https://discord.gg/KpN4eHY) are asking if Logseq can provide a CLI to do this in a shell script. The team replies that this is on their roadmap, but no ETA. I think this is not a high-priority task for the Logseq team as well.


Maybe it can be started right now to drive by the devs in the community.


I found it interesting and attempted to port the graph load & export using Node.js a while ago, but failed for some reasons.

- I am not that familiar with ClojureScript and the codes of how graph files are loaded(parse to tokens, AST with block hierarchy, etc) and exported seem very complex
- Logseq is changing at a fast pace. Maintaining it also take a lot of effort and I may not get the _right_ results anyway.
- The ROI (Return on investment) is very low IMHO

Because of this, I retreated from porting the graph loading & exporting and seeking other solutions.


# **Publish with Headless Logseq Desktop App?**


Logseq desktop is running in Electron. So I suppose if I can run Logseq desktop app headlessly, drive it with an automation tool and let the automation tool drive Logseq app and publish the graph, then the job is done.


This approach was very simple in theory, but I got stuck immediately on drive it with an automation tool step.


The only tool I tried is Cypress, because it was the tool I knew and it seems to be an industry standard on e2e testing for the Web. However, Cypress does not support testing Electron Apps (Logseq is powered by Electron) yet.


Then a few months later, in [this tweet](https://twitter.com/tiensonqin/status/1463784645447667715), I found a change by the new Logseq's team member Mono Wang that he used Playwright to replace Cypress to test the Desktop App.


WOW, I did not expect Playwright to have this ability! Good job Microsoft!


My expectation of Playwright was that it is a universal solution to drive popular browsers including Chromium based browsers, Firefox and Safari. I did not expect it also has the ability to [automate Electron](https://playwright.dev/docs/api/class-electron).


# **Release of** [**pengx17/logseq-publish**](https://github.com/pengx17/logseq-publish)


With a few more tries with the new approach, I managed to complete the work on the last day of 2021.


The most tricky part is that we need to **bypass Electron's open dir dialog when running with Playwright** in Logseq. This was patched by [https://github.com/logseq/logseq/pull/3531](https://github.com/logseq/logseq/pull/3531).


When the browser context has a `__MOCKED_OPEN_DIR_PATH__` flag, the open dir dialog will not show, but use this mocked directory directly. With this patch, we can also add e2e tests to testing graph load & publish cases.


The publish script is running in a Docker image build step. The reason of using Docker is because of its portability. Since building Logseq desktop app itself will take around ~12 minutes, I create two images, one for preparing for building Logseq desktop app and preparing for Playwright, and the other one is for running a custom Playwright script. As a result, the time of exporting this graph only takes 2 mins in a GitHub Action.


What does the Playwright script do:

- use Playwright to automate the Logseq App to load the given input graph dir
- set `window.__MOCKED_OPEN_DIR_PATH__` to the current working dir (e.g., ./graph) when load the graph
- after graph loaded, go to export it by setting `window__MOCKED_OPEN_DIR_PATH__` to `./graph-www`

The main body of GitHub Action is just a shell script that will copy the users graph into the Docker container and run the Playwright script.


As a last step, the user can pipe the result with [github-pages-deploy-action](https://github.com/JamesIves/github-pages-deploy-action) to deploy the page to GitHub pages.


As of 2022/01/06, Logseq's official Docs is already using this action to publish the docs!


# **Community**


[Xuanwo](https://twitter.com/OnlyXuanwo) refactored some of the implementation and helped me to make it to be very stable.


As it is for now, the action has ~50 stars already :D.

