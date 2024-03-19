import { expect } from "playwright/test";
import { Then } from "../common";

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
