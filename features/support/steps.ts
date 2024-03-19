import { expect } from "playwright/test";
import { registerCucumberPlaywright } from "../../cucumber-playwright";
import { Fixtures, fixtures } from "../../fixtures";

type WorldType = {
  myCount: number;
};

const initialWorld: WorldType = { myCount: 0 };

const { Then, When, defineStep } = registerCucumberPlaywright<WorldType, Fixtures>(
  () => initialWorld,
  fixtures
);

When("On the playwright page", async ({ page, world }) => {
  await page.goto("https://playwright.dev/");
});

Then(
  "The title {string} should be displayed",
  async ({ page }, title: string) => {
    await expect(page).toHaveTitle(new RegExp(title));
  }
);

When("The getting started button is clicked", async ({ page }) => {
  await page.getByRole("link", { name: "Get started" }).click();
});

Then("The installation link should be displayed", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Installation" })
  ).toBeVisible();
});

Then("make an API request", async ({ myCustomRequestContext }) => {
  const response = await myCustomRequestContext.get(
    "https://jsonplaceholder.typicode.com/todos/1"
  );
  expect(await response.json()).toEqual(
    expect.objectContaining({
      userId: 1,
    })
  );
});

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
