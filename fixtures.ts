import { FixtureInitializer } from "./cucumber-playwright";

export type Fixtures = { myFixture: string };

export const fixtures: FixtureInitializer<Fixtures> = {
  myFixture: async ({ page }, use) => {
    await use("hello");
  },
};
