Feature: Playwright Page

	Rule: It has the title

		Example: has title
			When On the playwright page
			Then The title 'Playwright' should be displayed

	Rule: It has the getting started link

		Example: has getting started link
			When On the playwright page
			And The getting started button is clicked
			Then The installation link should be displayed

	Scenario: use the world
		When the count is incremented
		Then the count is 1

	Scenario: API request
		* make an API request

	Scenario: Create a new page in the test
		* create a new page in the test
