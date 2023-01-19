if (process.env.HTTP_PROXY) {
  const ngp = require("node-global-proxy").default;
  ngp.setConfig(process.env.HTTP_PROXY);
  ngp.start();

  // patch fetch
  // https://github.com/gajus/global-agent/issues/52#issuecomment-1134525621
  const Undici = require("undici");
  const ProxyAgent = Undici.ProxyAgent;
  const setGlobalDispatcher = Undici.setGlobalDispatcher;

  setGlobalDispatcher(new ProxyAgent(process.env.HTTP_PROXY));
}
