
AFFiNE app allows the user to write their docs that live both locally (persisted in IndexDB) and also let the user to enable cloud syncing. This is handy, but we don’t want to make users think that their content is locked in AFFiNE.


To solve this issue, I wrote a small CLI tool [affine-exporter](https://github.com/pengx17/affine-reader/edit/master/README.md). With that you can export your whole cloud workspace, whether or not it is a public one, in to your disk.


It is pretty easy to use.

- Firstly, you need to have `pnpm` installed
- Secondly, find the workspace ID from the web URL. e.g., [https://app.affine.pro/workspace/8m-tkd647e/3-lgkfcutl](https://app.affine.pro/workspace/8m-tkd647e/3-lgkfcutl), `8m-tkd647e` is the workspace ID for your workspace
- Thirdly, grab the refresh token by invoking `JSON.parse(localStorage.getItem('affine:login')).refresh` in the browser console
- Then, open terminal, and run `pnpx affine-exporter -w "<workspace-id>" -t "<refresh-token>"`(replace your workspace id and refresh token)


You shall see the following content in the terminal:


![](/notion-images/9cff4037-4b13-4f3f-aae1-934f9cf80056.png)


Once the script finished, you should have your workspace data (with images) downloaded at the given path showing last line of the logs.


affine-exporter is part of the affine-reader repo. If you want, you can also use it to serve your blog content using [https://app.affine.pro/](https://app.affine.pro/). In fact, the offical blog content of AFFiNE is right now served by AFFiNE itself. You can read the following blog post for more info:


[bookmark](https://affine.pro/blog/using-affine-as-a-blog-technical)

