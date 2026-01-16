# Online Library – Software Testing Project

This repository contains an **Online Library** web application and the complete **software testing deliverables** created for the university course **Software Product Testing**.

The project includes:
- Functional and non-functional requirements (Specs)
- Test Plan
- Traceability matrix (FR → TC)
- Test cases (minimum 5)
- Bug reports (minimum 5)
- Auxiliary tests checklist
- Test automation (Playwright) + evidence (report/screenshot)
- Gantt planning (included in documentation)

---

## Features (Application)
- Books catalog page with book cards (title, author, category, stock, price)
- Search/filter books by title/author/category
- Borrow flow (add to Loan Cart)
- Purchase flow (select quantity, add to Purchase Cart)
- Internationalization: **RO / EN**
- Themes: **Light / Dark**

> Note: Some parts may behave differently depending on the current build and data seed.

---

## Project Structure (Suggested)
- `docs/`  
  - Final testing documentation PDF (Specs, Test Plan, Test Cases, Bug Reports, etc.)
  - Gantt chart
  - Screenshots / evidence
- `tests/`  
  - Automated tests (Playwright)
- `src/`  
  - Application source code

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm (or yarn/pnpm)

### Install dependencies
```bash
npm install
