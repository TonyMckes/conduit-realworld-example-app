# Conduit E2E — Playwright + TypeScript Test Framework

<!-- Replace OWNER/REPO once the repo is pushed to get a live status badge -->
[![E2E & API Tests](https://github.com/OWNER/REPO/actions/workflows/e2e.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/e2e.yml)

End-to-end and API test automation for the [RealWorld](https://github.com/gothinkster/realworld)
("Conduit") application — a Medium-style blogging platform. Built with
**Playwright** and **TypeScript**, using the Page Object Model, typed API
clients, custom fixtures, and CI on GitHub Actions.

📊 **[Live test report](https://OWNER.github.io/REPO/)** — published from the latest CI run.

## Why this project

This repository is a demonstration of how I design a maintainable test
framework, not just a set of scripts. It covers three layers:

- **API tests** against the REST contract (auth, CRUD, negative cases).
- **UI end-to-end tests** through the browser for real user journeys.
- **Accessibility checks** with axe-core — reflecting a frontend background,
  not only black-box automation.

Tests set up their data through the API and exercise only the behaviour under
test through the UI, which keeps E2E specs fast and stable.

## Tech stack

| Area            | Choice                                   |
| --------------- | ---------------------------------------- |
| Test runner     | Playwright Test                          |
| Language        | TypeScript (strict)                      |
| Architecture    | Page Object Model + custom fixtures      |
| Test data       | Faker (unique data per run)              |
| Accessibility   | @axe-core/playwright                     |
| CI / CD         | GitHub Actions (app booted in Docker/PG) |
| Reporting       | Playwright HTML report on GitHub Pages   |

## Project structure

```
src/
  api/        Typed API client for the Conduit REST API
  pages/      Page objects (Base, Login, Editor, Home)
  fixtures/   Custom Playwright fixtures (api client, pre-registered user)
  data/       Test-data factories
tests/
  api/        API-level specs
  ui/         Browser E2E specs
.github/
  workflows/  CI pipeline
```

## Getting started

### 1. Run the application under test

Clone and start [TonyMckes/conduit-realworld-example-app](https://github.com/TonyMckes/conduit-realworld-example-app).
By default it serves:

- Frontend: `http://localhost:3000`
- API: `http://localhost:3001/api`

### 2. Run the tests

```bash
npm install
cp .env.example .env          # adjust URLs if your instance differs
npx playwright install chromium
npm test                      # all tests
npm run test:api              # API tests only
npm run test:ui               # UI tests only
npm run report                # open the HTML report
```

## Test coverage

| Type | Scenario                                             |
| ---- | ---------------------------------------------------- |
| API  | Register a new user                                  |
| API  | Log in with valid credentials                        |
| API  | Reject login with an invalid password (negative)     |
| API  | Fetch the current user with a valid token            |
| UI   | Log in and publish an article end-to-end             |
| UI   | Home page has no critical accessibility violations   |

_Roadmap: comments, favourites, follow/unfollow, feed pagination and filters,
visual regression snapshots._

## Notes

The application under test is a community demo and may contain its own defects.
Bugs found while writing these tests are tracked in
[`BUGS.md`](./BUGS.md) / GitHub Issues, which documents the full QA loop rather
than only the automation.
