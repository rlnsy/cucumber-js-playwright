import { When as _When, After, Before, IWorldOptions, setDefaultTimeout, setWorldConstructor, World } from "@cucumber/cucumber";
import { DefineStepPattern, IDefineStepOptions } from "@cucumber/cucumber/lib/support_code_library_builder/types";
import { APIRequestContext, Browser, BrowserContext, chromium, Page } from "playwright";
import { PlaywrightTestArgs } from "playwright/test";

/**
 * Set up cucumber-js with the Playwright integration, returning the bound
 * step definition functions.
 * @param worldConstructor Function that initializes the world and can be used to infer world type.
 * @param defaultStepTimeout Default timeout for each cucumber step. It should be greater than the sum of playwright timeouts for any individual step. Timeouts for individual steps or hooks can also be set by passing timeout option.
 * @returns 
 */
export function registerCucumberPlaywright<T>(worldConstructor: () => T, defaultStepTimeout = 6000) {

class CustomWorld extends World {
  userWorld: T;
  page: Page;
  context: BrowserContext;
  browser: Browser;
  request: APIRequestContext;
  constructor(options: IWorldOptions) {
    super(options);
    this.userWorld = worldConstructor();
  }
}

setWorldConstructor(CustomWorld);

setDefaultTimeout(defaultStepTimeout);

Before({ name: "initialize playwright" }, async function (this: CustomWorld) {
  this.browser = await chromium.launch({}); // TODO: support other browsers
  this.context = await this.browser.newContext(); // TODO: support shared context? (see https://playwright.dev/docs/api/class-browsercontext)
  this.page = await this.context.newPage();
  this.request = this.page.request; // TODO
});

After({ name: "shut down playwright" }, async function (this: CustomWorld) {
  await this.context.close();
  await this.browser.close();
});

// the define step function in cucumber is deprecated, but we redefine it here to use the
// same logic for all step definition functions
// TODO: support other arguments to test callback?
function defineStep(pattern: DefineStepPattern, code: (args: PlaywrightTestArgs & { world: T }) => any | Promise<any>, options: IDefineStepOptions = {}) {
  _When(pattern, {
    timeout: defaultStepTimeout,
    ...options,
  }, async function (this: CustomWorld) {
    await code({ page: this.page, context: this.context, request: this.request, world: this.userWorld });
  });
}

  return {
    Given: defineStep,
    When: defineStep,
    Then: defineStep
  }
}
