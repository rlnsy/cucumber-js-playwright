const { Before, After, When, Then } = require("@cucumber/cucumber");
const { chromium, firefox, webkit } = require("playwright");
const { expect } = require("@playwright/test");

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

Then("The getting started link should be displayed", function () {
  // Write code here that turns the phrase above into concrete actions
  return "pending";
});

Then("The installation link should be displayed", function () {
  // Write code here that turns the phrase above into concrete actions
  return "pending";
});
