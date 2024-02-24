import {
  Before,
  After,
  When,
  Then,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { chromium, firefox, webkit } from "playwright";
import { expect } from "@playwright/test";

// should be greater than the sum of playwright timeout for any individual step
// timeouts for individual steps or hooks can also be set
setDefaultTimeout(6000);

Before({ name: "initialize playwright" }, async function () {
  this.browser = await chromium.launch({});
  this.page = await this.browser.newPage();
});

After({ name: "shut down playwright" }, async function () {
  await this.browser.close();
});

When("On the playwright page", async function () {
  await this.page.goto("https://playwright.dev/");
});

Then("The title should be displayed", async function () {
  await expect(this.page).toHaveTitle(/Playwrights/);
});

When('The getting started button is clicked', async function () {
  await this.page.getByRole("link", { name: "Get started" }).click();
});

Then("The installation link should be displayed", async function () {
  await expect(
    this.page.getByRole("heading", { name: "Installation" }),
  ).toBeVisible();
});
