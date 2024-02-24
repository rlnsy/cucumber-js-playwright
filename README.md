# Cucumber x Playwright

## First Approach: Use Playwright to Drive Automation in cucumber-js

Set up the project with both packages and the recommended structure and default settings.

Playwright test in tests/example.spec.ts

Cucumber feature file in features/example.feature
Cucumber step definitions in features/support/steps.js

Next step is to map the automation code from the playwright test into the step definitions.

But, there is a problem. All the code in the tests uses the “page” variable which is passed into the callback argument of the playwright “test” function. How can we reference this same value outside of a playwright test?

According to chat gpt (https://chat.openai.com/c/4c49218d-872f-4243-ae27-f9de14b73004) and the playwright docs (https://playwright.dev/docs/api/class-playwright) there is a way to drive automation without using playwright “test()” using the API. For example:

```
const browser = await chromium.launch(); // Or 'firefox' or 'webkit'.
const page = await browser.newPage();
await page.goto('http://example.com');
// other actions...
```

Usage of the Library is further described here: https://playwright.dev/docs/library

In cucumber js, we can set this up using some before and after (each) hooks and assigning some values to the World:

```
const { Before, After, When, Then } = require("@cucumber/cucumber");
const { chromium, firefox, webkit } = require("playwright");

Before({ name: "initialize playwright" }, async function () {
this.browser = await chromium.launch();
this.page = await this.browser.newPage();
});

After({ name: "shut down playwright" }, async function () {
await this.browser.close();
});
```

There are some apparent downsides already:

1. Need to use before each because before all doesn’t have access to the world (world is clean for each scenario). Therefore, we do the browser and page initialization for each scenario. Not sure exactly what the performance impact of this is.
2. We cannot access the playwright UI. As far as I can tell (and according to CGPT) the automation only operates in headless mode when being driven through the API. Also, since we initialize the browser for each scenario (1) we would in theory have a new chromium window for each scenario even if the UI could be displayed.

We can import the expect function from playwright test to provide assertions:

```
const { expect } = require("@playwright/test");

Then("The title should be displayed", async function () {
await expect(this.page).toHaveTitle(/Playwright/);
});
```

However, if the assertion fails we get a very unhelpful error message by default:

```
1. Scenario: has title # features/example.feature:5
   ✔ Before (initialize playwright) # features/support/steps.js:5
   ✔ When On the playwright page # features/support/steps.js:14
   ✖ Then The title should be displayed # features/support/steps.js:18
   Error: function timed out, ensure the promise resolves within 5000 milliseconds
   at Timeout.<anonymous> (/Users/rowan/Local/playwright-cucumber/node_modules/@cucumber/cucumber/lib/time.js:54:20)
   at listOnTimeout (node:internal/timers:573:17)
   at process.processTimers (node:internal/timers:514:7)
```

Unlike the really good message that appears when running with Playwright:

```
1. tests/example.spec.ts:3:5 › has title ─────────────────────────────────────────────────────────


    Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)

    Locator: locator(':root')
    Expected pattern: /Playwrights/
    Received string:  "Fast and reliable end-to-end testing for modern web apps | Playwright"
    Call log:
      - expect.toHaveTitle with timeout 5000ms
      - waiting for locator(':root')
```

The code used for this exercise can be found in this commit: https://github.com/rlnsy/cucumber-js-playwright/commit/2749118736fb12634410fffae0a6b35c5a249626

## Fixing the Error Messages
It looks like the main issue with the error message is because of a timeout. What's happening here is that the default expect timeout in Playwright is 5000ms, but the default step timeout in Cucumber JS is also 5000ms. Therefore, the test times out waiting for the expect to resolve and therefore we never actually get the error message.

The fix to this is to set the default timeout for cucumber to be the same as PLaywright:

```
const {setDefaultTimeout} = require('@cucumber/cucumber');

setDefaultTimeout(6000);
```

This gives us the error reporting that we want:

```
1) Scenario: has title # features/example.feature:5
   ✔ Before (initialize playwright) # features/support/steps.js:13
   ✔ When On the playwright page # features/support/steps.js:22
   ✖ Then The title should be displayed # features/support/steps.js:26
       Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)
       
       Locator: locator(':root')
       Expected pattern: /Playwrights/
       Received string:  "Fast and reliable end-to-end testing for modern web apps | Playwright"
       Call log:
         - locator._expect with timeout 5000ms
         - waiting for locator(':root')
         -   locator resolved to <html lang="en" dir="ltr" data-theme="light" data-rh="…>…</html>
         -   unexpected value "Fast and reliable end-to-end testing for modern web apps | Playwright"
         -   locator resolved to <html lang="en" dir="ltr" data-theme="light" data-rh="…>…</html>
         -   unexpected value "Fast and reliable end-to-end testing for modern web apps | Playwright"
         -   locator resolved to <html lang="en" dir="ltr" data-theme="light" data-has-…>…</html>
         -   unexpected value "Fast and reliable end-to-end testing for modern web apps | Playwright"
         -   locator resolved to <html lang="en" dir="ltr" data-theme="light" data-has-…>…</html>
         -   unexpected value "Fast and reliable end-to-end testing for modern web apps | Playwright"
         -   locator resolved to <html lang="en" dir="ltr" data-theme="light" data-has-…>…</html>
         -   unexpected value "Fast and reliable end-to-end testing for modern web apps | Playwright"
         -   locator resolved to <html lang="en" dir="ltr" data-theme="light" data-has-…>…</html>
         -   unexpected value "Fast and reliable end-to-end testing for modern web apps | Playwright"
         -   locator resolved to <html lang="en" dir="ltr" data-theme="light" data-has-…>…</html>
         -   unexpected value "Fast and reliable end-to-end testing for modern web apps | Playwright"
         -   locator resolved to <html lang="en" dir="ltr" data-theme="light" data-has-…>…</html>
         -   unexpected value "Fast and reliable end-to-end testing for modern web apps | Playwright"
         -   locator resolved to <html lang="en" dir="ltr" data-theme="light" data-has-…>…</html>
         -   unexpected value "Fast and reliable end-to-end testing for modern web apps | Playwright"
       
           at Proxy.<anonymous> (/Users/rowan/Local/playwright-cucumber/node_modules/playwright/lib/matchers/expect.js:174:37)
           at World.<anonymous> (/Users/rowan/Local/playwright-cucumber/features/support/steps.js:27:27)
   ✔ After (shut down playwright) # features/support/steps.js:18
```
