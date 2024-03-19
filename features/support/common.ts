import { registerCucumberPlaywright } from "../../cucumber-playwright";
import { Fixtures, fixtures } from "../../fixtures";

type WorldType = {
  myCount: number;
};

const initialWorld: WorldType = { myCount: 0 };

export const { Given, When, Then } = registerCucumberPlaywright<WorldType, Fixtures>(
  () => initialWorld,
  fixtures
);