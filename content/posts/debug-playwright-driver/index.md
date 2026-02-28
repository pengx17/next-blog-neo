
We may encounter the following errors when running Playwright tests: 


![](/notion-images/136cd55b-6c56-8071-b52b-d5ea1d226bd6.png)


If the error can be reproduce locally but no obvious issues can be identified, you can follow this article to debug the [InjectedScript](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/injected/injectedScript.ts) in the browser that drives by Playwright.

> The main working principle of Playwright is to [inject](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/dom.ts#L89C3-L89C17) [JavaScript code](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/injected/injectedScript.ts) into the browser, communicate with the Node layer (test code + Playwright server driver) to [drive the browser](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/frames.ts#L1178-L1183), and simulate user behavior.

---


We can debug the server side code like debugging a normal Node process. For the injected code in the browser, please follow the following steps:

- Run Playwright tests with headless mode off and env var `PWTEST_UNDER_TEST = 1`
    1. see [playwright/packages/playwright-core/src/utils/debug.ts at d4ad520a9bf0fea78b610c065af0b0c896229666 · microsoft/playwright](https://github.com/microsoft/playwright/blob/d4ad520a9bf0fea78b610c065af0b0c896229666/packages/playwright-core/src/utils/debug.ts#L38)
- In the browser that brought by playwright, open devtools / console，print & show function definition of `__injectedScript.constructor`

    ![](/notion-images/136cd55b-6c56-8036-b37e-cb9ccebb1964.png)

- Set break point that you wishes to debug, like  `checkElementStates` :

    ![](/notion-images/136cd55b-6c56-80b7-9eeb-e3e73846ae7e.png)

> source: [https://insider.affine.pro/workspace/af3478a2-9c9c-4d16-864d-bffa1eb10eb6/dRMIGB3bd0IdVWKFrEoBm?mode=page&blockIds=z5WJ5eHNS3mwTGpgmbzh1](https://insider.affine.pro/workspace/af3478a2-9c9c-4d16-864d-bffa1eb10eb6/dRMIGB3bd0IdVWKFrEoBm?mode=page&blockIds=z5WJ5eHNS3mwTGpgmbzh1)

## End

