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

  // also see https://github.com/nodejs/undici/issues/1650
  global[Symbol.for("undici.globalDispatcher.1")] = new ProxyAgent(
    process.env.HTTP_PROXY
  );

  console.log("proxy enabled: " + process.env.HTTP_PROXY);
}
