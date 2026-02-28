
## **Tailwind was a noisemaker 😵**


[Tailwind CSS](https://tailwindcss.com/) has been a buzzword for quite some time. I have seen it in many different places: Twitter, DEV.to, Podcast, etc. I learned a bit during the time I was exploring the eco-system of [CSS in JS](https://pengx17.vercel.app/posts/css-in-js) and when browsing causal stuff during working hours.


I could still recall for the first time, around mid-2020, when I saw Tailwind that it seemed to be a step back that could rewind back to the good-old bootstrap time. This statement was so true that during searching I could see a lot of [opponents](https://dev.to/jaredcwhite/why-tailwind-isn-t-for-me-5c90) with an equal community to its [proponents](https://www.swyx.io/why-tailwind/). Who really needs _atomic_ or _utilities_ when he is really good at CSS? This seems to be an even more skeptical concept of CSS in JS.


Sometime later, the author of Tailwind announced that he [gained quite a lot of money](https://adamwathan.me/tailwindcss-from-side-project-byproduct-to-multi-mullion-dollar-business/) from [Tailwind UI](https://tailwindui.com/) framework, which is a UI framework with tailwind as the foundation. This was big news! I was curious as well and listened to a [Podcast by the author](https://changelog.com/news/the-tailwind-beneath-my-wings-nLXW) on Changelog.


I have to say, I still have yet to buy the idea even after I read or listen to many of these materials about Tailwind. There are several reasons:

- I enjoy how css-in-js could solve my problems in general
- I can still have original CSS for simple tasks or module css to solve scoping issues
- configuring Tailwind is troublesome
- learning Tailwind vocabulary requires practice in action
- I am afraid of learning domain-specific knowledge
- I don't like long class names in HTML

Though I myself did not get it, I believe that there is a reason why opinion leaders are talking about it positively. In the meantime, all modern JS tools (Webpack, Parcel, Vite, Next.JS ...) support it either as a first-class plugin, or have a widely adopted community solution. There are even some dialects that have similar syntaxes to Tailwind, but with some of their own selling points.


It was very alike the time when CSS-in-JS became a de-facto standard back to 2 ~ 3 years ago. Emotion CSS, styled-components and other solutions were all converging towards a couple of common interfaces within some uniqueness of their own. For Tailwind, its domain-specific syntaxes are now among the common lang in practice. It also has a rather mature ecosystem of plugins and libraries, maintained by a community of developers with cool design aspects in their minds.


## **I knew it is about the time**


I force myself to use a Tailwind dialet, aka [Windicss](https://windicss.org/) in some of my [Logseq plugins](https://github.com/pengx17?tab=repositories&q=logseq&type=source&language=&sort=). The reason I adopted this solution instead of Tailwind is that [it seems to be faster than Tailwind CLI](https://antfu.me/posts/reimagine-atomic-css) with its JIT mode; also it is advocated by an active Vite member [@antfu](https://github.com/antfu). TBH I don't know the best practices; I don't understand its philosophy; I don't know how it works. But the good news is that I can get started using it just by adding a few lines of configurations into a Vite project.


I was starting to understand why it was promoted by the community:

- it enforces consistency & best practices
- responsiveness over simple variant decorations
- it has really nice IDE integrations (VS Code plugin, for example) to get rid some of the time of document-lookup

Despite these obvious facts, these are not really the sweet points to me. The sweet point is that it feels VERY alike **inline styles!** You know what? I 💙 inline-styles.


I really don't like to constantly switch to another CSS file to style a random element to focus on productivity. This is the very reason I like CSS-in-JS in the first place. Furthermore, Tailwind also provides an even more powerful solution than plain-old inline styles.


I became a [过来人](https://www.swyx.io/guo-lai-ren/) for Tailwind.


## **Hill climbing 🧗🏻‍♂️**


Now I am able to start using Tailwind for simple applications. However, I do encounter some novice issues and to some extent they all make me struggle.


### **Stylize a UI library**


So if I want to use Tailwind to stylize a UI library, how do I make sure its styles can be well fit into other applications? Do I need to ship the Tailwind utility classes to the user? If not, is this UI library is constrained to be used in another App configured with Tailwind as well? Will the purging algorithm be applied to styles in `node_modules`?


In the market, there are many UI libraries built on top of Tailwind, like [Tailwind UI](https://tailwindui.com/), [VechaiUI](https://www.vechaiui.com/), etc (more can be found at [https://github.com/aniftyco/awesome-tailwindcss#ui-libraries-components--templates](https://github.com/aniftyco/awesome-tailwindcss#ui-libraries-components--templates)). The question is, they all require the user to have Tailwind to be configured.


I personally found that [Twind](https://twind.dev/) or [Twin.macro](https://github.com/ben-rogerson/twin.macro) may fit better in some cases than vanilla Tailwind. It is said to be a tailwind-in-js, which comes with a small runtime to dynamically inject styles into HTML on the fly. It allows the user to output the class names into hashes and define the output target (like a string) etc.


### **Working with other CSS solutions**


Tailwind encourages us to write all styles in HTML class names, but sometimes we still have to break the wall and write plan CSS, or integrate with other CSS solutions. TBH I do not know the best practices for this yet.


### **Pre-flight**


Another cool thing about Tailwind is that it comes with a well-defined set of base styles ["built on top of modern-normalize"](https://tailwindcss.com/docs/preflight). In short, it resets many native HTML elements to make them either behave like a `span` or a `div`. Its pre-flight also comes with some hidden utilities to make the development faster, for example, it defines the following [rules for borders](https://github.com/tailwindcss/tailwindcss/pull/116):


```css
*,
::before,
::after {
  --tw-border-opacity: 1;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
```


This means if we want to add a border to one element, we can just add `class="border"` to it, instead of having `class="border border-solid border-grey-200"`. This is really convenient, however, it comes to be a bit of surprising if we ship a UI component with the border defined with pre-flight, but use it in an application without such rules. It seems that Tailwind preflight is a double-edge that is easy to use in the first place but bites you during porting.


## **`<FIN />`**


I like how Tailwind provides a solution to gracefully styling with an old-school external, but with modern internals. It is simple but powerful. I understand people really want an ultimate solution to every issue, but there is a sense to me that Tailwind is far from being a silver bullet.


Even though there are many dialects of Tailwind, like Windicss, Unocss, etc, I am also afraid that these dialects of Tailwind will not be everlasting than vanilla Tailwind. These tools of Tailwind might not be the best ones in terms of internal implementation, however, I believe Tailwind will be the evergreen standards than its followers.


In the end, I would use it for some side projects, try different flavors of Tailwind, and am happy to see what it can become in the next couple of years.

