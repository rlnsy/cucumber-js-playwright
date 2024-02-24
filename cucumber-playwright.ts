import { When as _When, After, Before, IWorldOptions, setDefaultTimeout, setWorldConstructor, World } from "@cucumber/cucumber";
import { DefineStepPattern } from "@cucumber/cucumber/lib/support_code_library_builder/types";
import { APIRequestContext, Browser, BrowserContext, chromium, Page } from "playwright";
import { PlaywrightTestArgs } from "playwright/test";

type UserWorld = Partial<{ foo: number }>;

class CustomWorld extends World {
  userWorld: UserWorld = {};
  page: Page;
  context: BrowserContext;
  browser: Browser;
  request: APIRequestContext;
  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);

// should be greater than the sum of playwright timeout for any individual step
// timeouts for individual steps or hooks can also be set
setDefaultTimeout(6000);

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
function defineStep(pattern: DefineStepPattern, code: (args: PlaywrightTestArgs & { world: UserWorld }) => any | Promise<any>) {
  _When(pattern, async function (this: CustomWorld) {
    await code({ page: this.page, context: this.context, request: this.request, world: this.userWorld });
  });
}

export const Given = defineStep;
export const When = defineStep;
export const Then = defineStep;
