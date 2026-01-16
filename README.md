# Online Library System — App + Software Testing Project

A small client-side **library management web app** built with **React + Vite**. Users can browse a book catalog, **borrow** or **buy** books, and track loans and activity history. An **Admin area** is included for managing the catalog and stock.

This repository also includes the complete **Software Product Testing** coursework package: **requirements (functional/visual/non-functional), test plan, auxiliary tests, test cases, bug reports, traceability, and test automation**.

---

## What’s inside

### Application
- Register / login
- Catalog browsing + search (title/author/category)
- **Borrow** flow: add to Loan Cart (one copy per title) + confirm
- **Buy** flow: Purchase Cart with quantity + confirm
- My Loans (return borrowed books)
- History (borrow/return/buy actions)
- Admin features: add/update books, update price, manage stock, disable/reactivate, reset demo data

### Testing deliverables
- **Functional requirements** (core flows: catalog, search, borrow, buy, history)
- **Visual/UI requirements** (layout, primary colors, card grid, header navigation, Light/Dark)
- **Non-functional requirements** (performance basics, data consistency, security basics, compatibility, usability)
- **Test Plan** (scope, strategy, entry/exit criteria, risks, deliverables)
- **Auxiliary tests** (browser compatibility, UI/responsive checks, security basic checks, performance/persistence)
- **Test Cases** (executed set included)
- **Bug Reports** (documented issues with steps, expected vs actual, severity/priority)
- **Traceability matrix** (FR → TC)
- **Automation** (Playwright E2E): Smoke + Regression + Client requirements + HTML report

---

## Demo Credentials
- **Admin:** `admin@local`  
- **Password:** `admin123`  
(You can also register a normal user from the Register page.)

---

## Tech Stack
- React (Vite)
- React Router
- ESLint
- Playwright (E2E automation)

---

## Run locally
```bash
npm install
npm run dev
