import { expect } from "playwright/test";
import { registerCucumberPlaywright } from "../../cucumber-playwright";
import { Fixtures, fixtures } from "../../fixtures";

const { defineStep, Then, When } = registerCucumberPlaywright<{ foo: number }, Fixtures>(() => ({ foo: 1 }), fixtures);

When("On the playwright page", async ({ page, world: { foo } }) => {
  await page.goto("https://playwright.dev/");
});

Then("The title {string} should be displayed", async ({ page }, title: string) => {
  await expect(page).toHaveTitle(title);
});

When("The getting started button is clicked", async ({ page }) => {
  await page.getByRole("link", { name: "Get started" }).click();
});

Then("The installation link should be displayed", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Installation" })
  ).toBeVisible();
});

defineStep("Get custom fixture info", async ({ myFixture }) => {
  expect(myFixture).toEqual("hello")
});

defineStep("make an API request", async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/todos/1');
  expect(await response.json()).toEqual(expect.objectContaining({
    userId: 1
  }));
});