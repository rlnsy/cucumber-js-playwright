import { APIRequestContext } from "playwright";
import { FixtureInitializer } from "./cucumber-playwright";

export type Fixtures = { myCustomRequestContext: APIRequestContext };

export const fixtures: FixtureInitializer<Fixtures> = {
  myCustomRequestContext: async ({ request }, use) => {
    await use(request);
  },
};
