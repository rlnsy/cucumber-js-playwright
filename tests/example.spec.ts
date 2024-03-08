import { test, expect } from "@playwright/test";
import { Fixtures, fixtures } from "./fixtures";

const testWithCustomFixture = test.extend<Fixtures>(fixtures);

test("has title", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwrights/);
});

test("get started link", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Click the get started link.
  await page.getByRole("link", { name: "Get started" }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(
    page.getByRole("heading", { name: "Installation" }),
  ).toBeVisible();
});

testWithCustomFixture("get fixture value", ({ myFixture }) => {
  expect(myFixture).toEqual("hello")
});

test("API request", async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/todos/1');
  expect(await response.json()).toEqual(expect.objectContaining({
    userId: 1
  }));
});
