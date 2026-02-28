
## **The problem**


In YJS, there is a term called “provider” which connects a data source with a y.Doc. In reality, there could be multiple datasources for a single y.Doc and thus we could have multiple data backups for a single monolith y.Doc. Each provider can be seen as an adapter that bridges the doc and the datasource

- on connection, sync missing data between data source and the local doc
- send new updates made to doc to data source
- apply new updates from data source to local doc

This is fine for a small scale document that the data to be synced are around a few megabytes. However when the size of the document goes up, the monolith y.Doc becomes slow and unnecessary to sync all child nodes.


The YJS project provide a way to split a single doc into a tree that having doc as the leaves. These embedded doc object is called “[subdocument](https://docs.yjs.dev/api/subdocuments)”, or sub docs. With sub-docs, it is not necessary to eagerly load all documents on connection, especially for local data sources such as SQLite and IndexedDB.


Loading and parsing an entire doc tree with sub docs could take a lot of time and could freeze the application. Therefore, a better approach is needed to offload the documents that are not high priority and load them at a later time, optimally when the part of the document is being used, which is commonly known as on-demand loading, or **lazy loading**.


We have different types of data sources, such as IndexedDB, SQLite, WebSocket, BroadcastChannel, etc. Each of them requires some effort to make their own implementation of the provider, handling connection and disconnection, listening to document and data source events, and syncing between the document and the data source.


Currently, there are no official provider bindings that are optimized for sub-documents, and it is the responsibility of the Yjs application developer to make such efforts. In [AFFiNE](https://affine.pro/) which is our solution to yjs based note-taking tool, we have several rounds of thinking how to make the best of sub docs and we will provider a quick insight about our approach in this blog post.


## The naive solution to subdoc provider


There are several proposals that are made along the way. The naive solution is to create a new provider for each subdoc that are being embedded. Each sub doc is treated equally and works on their own. The problem is that it may create new connections for each of the provider, which will have a big impact on performance if we are using websocket connections. For efficiency, we will only consider **using a single provider** for a root doc tree.


### Reference Count Based


The key is to rely on React hook lifecycle to determine whether or not a page or part of a page is being used.

- On connection, we will find the doc in the doc tree, increase its reference counter.
- On unmount (React hook cleanup in `useEffect`), call `provider.disconnect(guid)`. This time we will decrease the doc by 1.
- If the reference counter equals to 1, we will setup the connection:
    - sync doc with the datasource. i.e., get the full doc from remote, apply it to local and then send the diff to remote
    - setup doc's `update` event listener. We may not need to setup other events any longer
    - setup remote's update event. (this may not be required if the remote does not send such events)

If the reference counter equals to 0, we will cleanup the listeners.


![](/notion-images/b933f8e5-899a-43f7-a6b4-719af00cea8c.png)


This solution works, however it has several flaws

- in real world we may don’t need to make lazy load that actuate with a RC-based approach
- with React `useEffect` , because ref count could change rapidly between 0 and connection/disconnection could happen too often and cause some unexpected issues
- we cannot handle cases that sub doc with nested sub docs. The RC for the nested doc is out of our control.

### Simplified Solution that relies on y.Doc flags and event


After all, we realized that it is more important to have lazy loading, but not to consider lazy offloading. Which is to say, we can use native y.Doc’s `shouldLoad` and `subdocs` event to know when to load the sub docs. The renewed diagram:


![](/notion-images/f285a6db-7c0e-4c11-8b99-6ade5ba5b30b.png)


## A common pattern


The pattern for the providers becomes quite complex when we incorporate sub-docs, but we can see a common pattern among them that most of the work can be abstracted into two parts: the **data source abstraction** and the **provider which handles synchronization between the data source and the document**.


In the final solution, we provided an abstraction layer to solve this issue.


Firstly, you need to implement your **datasource** with the following interface:


```javascript
export interface DatasourceDocAdapter {
  // request diff update from other clients
  queryDocState: (
    guid: string,
    options?: {
      stateVector?: Uint8Array;
      targetClientId?: number;
    }
  ) => Promise<Uint8Array | false>;

  // send update to the datasource
  sendDocUpdate: (guid: string, update: Uint8Array) => Promise<void>;

  // listen to update from the datasource. Returns a function to unsubscribe.
  // this is optional because some datasource might not support it
  onDocUpdate?(
    callback: (guid: string, update: Uint8Array) => void
  ): () => void;
}
```


Then, you can create a sub doc provider with `createLazyProvider`. e.g.:


```javascript
provider = createLazyProvider(rootDoc, datasource, { origin: 'sqlite' });
```


Inside of `createLazyProvider`, it will connect the root doc with the data source with the adapter. When any new sub doc is loaded via `doc.load` or it is marked as `shouldLoad: true`, the listener in provider will be responsible for

- exchange the diff between Doc and the data source using `queryDocState` and `sendDocUpdate`
- listen to update of the doc and send the update to remote data source via `sendDocUpdate`
- optionally, listen to update from the data source via `onDocUpdate` and apply the update to the doc
    - if this happens, the update originates from this provider will trigger update to doc, and other data source providers will get notified and propagated the update to their ends.

### Performance


Comparing between the old (above) and new (below) doc provider figures using Chrome’s dev tool, you can clearly see that the performance gain with the new provider.


![](/notion-images/08de9202-291b-44fb-a74d-857646894101.jpg)


We will be releasing this new lazy load doc provider in the upcoming 0.8.0 version. Hopefully you will enjoy it 🙂


### References


[link_preview](https://github.com/toeverything/AFFiNE/issues/3029)


[link_preview](https://github.com/toeverything/AFFiNE/pull/3351)


[link_preview](https://github.com/toeverything/AFFiNE/pull/3330)

