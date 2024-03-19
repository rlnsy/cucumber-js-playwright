import { expect } from "playwright/test";
import { Then, When } from "../common";

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
