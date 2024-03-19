import { expect } from "playwright/test";
import { Then, When, defineStep } from "../common";

When("the count is incremented", ({ world }) => {
  world.myCount++;
});

Then("the count is {int}", ({ world: { myCount } }, count: number) => {
  expect(myCount).toEqual(count);
});

defineStep("create a new page in the test", async ({ context }) => {
  const secondPage = await context.newPage();
  // this creates a second window attached to the same browser instance
  // to see it for yourself, add some wait and run in headed mode
});
