import {
  When,
  After,
  Before,
  IWorldOptions,
  setDefaultTimeout,
  setWorldConstructor,
  World,
  AfterAll,
  BeforeAll,
} from "@cucumber/cucumber";
import {
  DefineStepPattern,
  IDefineStepOptions,
} from "@cucumber/cucumber/lib/support_code_library_builder/types";
import {
  APIRequestContext,
  Browser,
  BrowserContext,
  webkit,
  Page,
} from "playwright";
import { PlaywrightTestArgs } from "playwright/test";
import * as zod from "zod";

export type FixtureInitializer<F> = {
  [k in keyof F]: (
    args: PlaywrightTestArgs,
    use: (value: F[k]) => Promise<void>
  ) => Promise<void>;
};

const environmentSchema = zod.object({
  // BUILT IN
  CUCUMBER_PARALLEL: zod.unknown(),
  CUCUMBER_TOTAL_WORKERS: zod.unknown(),
  CUCUMBER_WORKER_ID: zod.unknown(),

  // CUSTOM
  CUCUMBER_PLAYWRIGHT_HEADLESS: zod.union(
    [zod.literal("true"), zod.literal("false")]
  ).optional()
});

function getEnvironment() {
  return environmentSchema.parse(process.env);
}

// stored globally for this worker
let browser: Browser;
let env: zod.infer<typeof environmentSchema>;

/**
 * Set up cucumber-js with the Playwright integration, returning the bound step definition functions.
 *
 * @param worldConstructor
 * Function that initializes the world and can be used
 * to infer world type.
 *
 * @param fixtures
 * Object containing functions for initializing fixtures, as passed to `test.extend`.
 *
 * @param defaultStepTimeout
 * Default timeout for each cucumber step. It should be greater than the sum of playwright timeouts for any individual step. Timeouts for individual steps or hooks can also be set by passing timeout option.
 *
 * @returns The step definition functions (Given, When, Then).
 */
export function registerCucumberPlaywright<T, F>(
  worldConstructor: () => T,
  fixtures: FixtureInitializer<F>,
  defaultStepTimeout = 6000
) {
  // define custom world data type for cucumber to manage
  // This includes the world used in the step logic as
  // well as Playwright fixtures
  class CustomWorld extends World {
    userWorld: T;
    userFixtures: F;
    builtInFixtures: {
      page: Page;
      context: BrowserContext;
      request: APIRequestContext;
    };
    constructor(options: IWorldOptions) {
      super(options);
      this.userWorld = worldConstructor();
    }
  }

  setWorldConstructor(CustomWorld);

  // set default timeout for cucumber step runner
  setDefaultTimeout(defaultStepTimeout);

  BeforeAll(async () => {
    env = getEnvironment();
    browser = await webkit.launch({
      headless: env.CUCUMBER_PLAYWRIGHT_HEADLESS !== "false", // default to true
    });
  });

  // Run Playwright initialization routine before each test
  Before({ name: "initialize playwright" }, async function (this: CustomWorld) {
    // create the browser, context, page, and request context using
    // the Playwright Library
    const context = await browser.newContext();
    const page = await context.newPage();
    const request = page.request;

    // store references to the built in fixtures (TestArgs)
    this.builtInFixtures = { context, page, request };

    // create user-defined fixtures
    this.userFixtures = {} as F;
    Object.entries(fixtures).forEach(async ([name, initFixture]) => {
      let value: any;
      await (initFixture as any)(this.builtInFixtures, (userValue: any) => {
        value = userValue;
      });
      this.userFixtures[name] = value;
    });
  });

  // Clean up the browser and context after each test
  After({ name: "shut down playwright" }, async function (this: CustomWorld) {
    await this.builtInFixtures.context.close();
  });

  AfterAll(async () => {
    await browser.close();
  });

  // create the step definition function
  function defineStep(
    pattern: DefineStepPattern,
    code: (
      args: PlaywrightTestArgs & F & { world: T },
      ...params: any[]
    ) => any | Promise<any>,
    options: IDefineStepOptions = {}
  ) {
    // wrap step handler to convert internal world data into the user consumed structure.
    const runUserCode = async (world: CustomWorld, ...params: unknown[]) => {
      return await code(
        {
          ...world.builtInFixtures,
          ...world.userFixtures,
          world: world.userWorld,
        },
        ...params
      );
    };

    // derive step handler arity from the provided function
    const numParams = code.length - 1;

    // Next we need to generate a function using the function constructor
    // since cucumber will not allow variadic functions as step definition
    // handlers.

    // create parameter expression
    const paramArgs = Array.from(Array(numParams).keys()).map(
      (i) => `param${i}`
    );

    // create handler function by binding the user code routine
    // to a dynamically created function factory
    const handler = new Function(
      "fn",
      `return async function (${paramArgs.join(",")}) { return await fn(${[
        "this",
        ...paramArgs,
      ].join(",")}) }`
    )(runUserCode);

    // register the step definition
    When(
      pattern,
      {
        timeout: defaultStepTimeout,
        ...options,
      },
      handler as any
    );
  }

  return {
    defineStep,
    Given: defineStep,
    When: defineStep,
    Then: defineStep,
  };
}
