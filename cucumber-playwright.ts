import { When as _When, After, Before, IWorldOptions, setDefaultTimeout, setWorldConstructor, World } from "@cucumber/cucumber";
import { DefineStepPattern, IDefineStepOptions } from "@cucumber/cucumber/lib/support_code_library_builder/types";
import { APIRequestContext, Browser, BrowserContext, chromium, Page } from "playwright";
import { PlaywrightTestArgs } from "playwright/test";

export type FixtureInitializer<F> = { [k in keyof F]: (args: PlaywrightTestArgs, use: (value: F[k]) => Promise<void>) => Promise<void> };

/**
 * Set up cucumber-js with the Playwright integration, returning the bound
 * step definition functions.
 * @param worldConstructor Function that initializes the world and can be used to infer world type.
 * @param fixtures Object containing functions for initializing fixtures, as passed to `test.extend`.
 * @param defaultStepTimeout Default timeout for each cucumber step. It should be greater than the sum of playwright timeouts for any individual step. Timeouts for individual steps or hooks can also be set by passing timeout option.
 * @returns 
 */
export function registerCucumberPlaywright<T, F>(worldConstructor: () => T, fixtures: FixtureInitializer<F>, defaultStepTimeout = 6000) {

class CustomWorld extends World {
  userWorld: T;
  userFixtures: F;
  builtInFixtures: {
    page: Page;
    context: BrowserContext;
    browser: Browser;
    request: APIRequestContext;
  };
  constructor(options: IWorldOptions) {
    super(options);
    this.userWorld = worldConstructor();
  }
}

setWorldConstructor(CustomWorld);

setDefaultTimeout(defaultStepTimeout);

Before({ name: "initialize playwright" }, async function (this: CustomWorld) {
  const browser = await chromium.launch({});
  const context = await browser.newContext();
  const page = await context.newPage();
  const request = page.request;
  this.builtInFixtures = { browser, context, page, request };

  // TODO add type safety
  this.userFixtures = {} as F;
  Object.entries(fixtures).forEach(async ([name, initFixture]) => {
    let value: any;
    await (initFixture as any)(this.builtInFixtures, (userValue: any) => { value = userValue; })
    this.userFixtures[name] = value;
  });
});

After({ name: "shut down playwright" }, async function (this: CustomWorld) {
  await this.builtInFixtures.context.close();
  await this.builtInFixtures.browser.close();
});

// the define step function in cucumber is deprecated, but we redefine it here to use the
// same logic for all step definition functions
function defineStep(pattern: DefineStepPattern, code: (args: PlaywrightTestArgs & F & { world: T }) => any | Promise<any>, options: IDefineStepOptions = {}) {
  _When(pattern, {
    timeout: defaultStepTimeout,
    ...options,
  }, async function (this: CustomWorld) {
    await code({
      ...this.builtInFixtures,
      ...this.userFixtures,
      world: this.userWorld
    });
  });
}

  return {
    Given: defineStep,
    When: defineStep,
    Then: defineStep
  }
}
