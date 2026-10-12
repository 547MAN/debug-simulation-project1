# Good Goods — AI Debugging Simulation (Project 1)

A full-stack shop built as a series of **deliberate debugging challenges**. The codebase is AI-generated; the goal is to understand it, independently investigate problems, research possible solutions, and improve the application without asking AI to fix the challenge.

## The application

**Good Goods** is a small, responsive online store with:

- A browsable catalog with search, categories, and sorting
- Product details, stock limits, and an interactive shopping cart
- A checkout form that sends orders to a real backend API
- Server-side order validation and local JSON-file order persistence
- A React frontend and ASP.NET Core (.NET 10) minimal API backend

This is an educational shop. Checkout places **simulated orders only**; no real payments, accounts, shipping, or production security guarantees are implemented.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (with npm)
- Git

Verify your tools are available by running the commands dotnet --version, node --version, and npm --version.

## Running locally

From the repository root, run:

    npm run setup
    npm run dev

Open **http://127.0.0.1:5173** for the storefront. The backend uses **http://127.0.0.1:5080** and exposes /api/health, /api/products, /api/categories, and /api/orders.

You can also start either half separately:

    npm run dev:api
    npm run dev:web

Press Ctrl+C to stop the combined development command.

## How the debugging simulation works

This repository is **intentionally not in a fully working state at the start of a challenge**.

1. Pull the latest challenge from main.
2. Run the application and observe what fails.
3. Reproduce the problem, read the relevant code, and research a solution.
4. Apply **your own fix** and verify the expected behavior.
5. Commit and push your fix to main.
6. Tell the AI assistant you've completed the challenge. A **new, distinct bug** will be introduced in a **separate commit**.

**Spoiler policy:** Challenge commit messages stay generic. The assistant should not reveal the bug's location, root cause, or solution unless asked for a hint or review. Avoid examining the assistant's diff if you want to preserve the challenge.

### What counts as success?

For the first challenge, the goal is to start the application successfully, load products, add products to the cart, and submit a simulated order.

## Architecture

    frontend/                    React + Vite storefront
      src/App.jsx               UI, cart, and checkout
      src/api.js                HTTP client
      src/styles.css            Responsive design
    backend/Shop.Api/            ASP.NET Core minimal API
      Program.cs                HTTP endpoints and startup
      Models/                   Shared backend data models
      Services/                 Product catalog and order storage
      Data/products.json        Starter inventory
    scripts/dev.mjs              Runs frontend and backend together

Orders are saved locally in a generated backend output folder ignored by Git.

## Learning goals

I want to become proficient in **reading and maintaining code I did not write**, particularly AI-generated code that may contain subtle errors, fragile design decisions, or unnecessary complexity. The goal is to understand what needs changing, fix it thoughtfully, and turn unreliable AI output into better software through independent investigation.
