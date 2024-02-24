Feature: Playwright Page

	Rule: It has the title

		Example: has title
			When On the playwright page
			Then The title should be displayed

	Rule: It has the getting started link

		Example: has getting started link
			When On the playwright page
			And The getting started button is clicked
			Then The installation link should be displayed
