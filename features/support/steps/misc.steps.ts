import { expect } from "playwright/test";
import { Given, Then, When } from "../common";

When("the count is incremented", ({ world }) => {
  world.myCount++;
});

Then("the count is {int}", ({ world: { myCount } }, count: number) => {
  expect(myCount).toEqual(count);
});

Given("create a new page in the test", async ({ context }) => {
  const secondPage = await context.newPage();
  // this creates a second window attached to the same browser instance
  // to see it for yourself, add some wait and run in headed mode
});

Given("access environment variable in the test", async ({ env }) => {
  expect(env.CUCUMBER_WORKER_ID).toBeDefined();
});
