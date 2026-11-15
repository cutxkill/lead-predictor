# LeadPredictor

A simple sales-funnel calculator. Given a revenue target and an average order value it works out how many customers, leads and prospects a campaign needs, and charts the progress month by month.

## Formulas

1. Customers = Total Revenue / Avg. Order Value
2. Leads = Customers * 100 / Lead Response Rate (%)
3. Prospects = Leads * 100 / Prospect Response Rate (%)

Example: 10000 / 1000 = 10 customers, 10 * 100 / 40 = 25 leads, 25 * 100 / 20 = 125 prospects.

## Features

- Live recalculation when any input or slider changes
- Cumulative stacked bar chart per campaign month with hover tooltip
- English and Bulgarian interface, selectable currency
- No dependencies, plain HTML/CSS/ES modules

## Run locally

ES modules need an HTTP server, e.g. `npx serve .`, then open the printed address.

## Tests

```
npm test
```

## Deploy

Static site, deployed on Netlify (`netlify.toml` publishes the repository root).

Live demo: https://lead-predictor-cutxkill.netlify.app
