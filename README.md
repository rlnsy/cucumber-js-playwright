# Cucumber x Playwright

POC for using Playwright automation with Cucumber

Set up the project with both packages and the recommended structure and default settings.

It works really well with the official VSCode extension: https://marketplace.visualstudio.com/items?itemName=CucumberOpen.cucumber-official

Run example tests with
```
npm t
```

The biggest downside of this setup is that the graphical playwright runner cannot be used.

However, you can run the browser in headed mode by setting `CUCUMBER_PLAYWRIGHT_HEADLESS=false` where Cucumber is run.

Each parallel worker will spawn a new instance of the browser (expect to see multiple playwright icons in your dock - one for each worker).
