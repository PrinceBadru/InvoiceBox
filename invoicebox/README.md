# InvoiceBox — Setup Guide

## Prerequisites
- Node.js 18+ installed (https://nodejs.org)
- A terminal / command prompt

## Quick start

```bash
# 1. Unzip the project
unzip invoicebox.zip
cd invoicebox

# 2. Install dependencies (takes ~30 seconds)
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# Visit: http://localhost:5173
```

## Demo accounts

| Role       | Email                                        | Password     |
|------------|----------------------------------------------|--------------|
| Provider   | kampalatrading1@provider.invoicebox.ug       | pass1234     |
| Provider   | nileterprises2@provider.invoicebox.ug        | pass1234     |
| Purchaser  | makerere1@purchaser.invoicebox.ug            | pass1234     |
| Purchaser  | stanbic4@purchaser.invoicebox.ug             | pass1234     |
| Admin      | admin@invoicebox.ug                          | Admin@2024   |

> All provider/purchaser accounts use password: **pass1234**
> Quick-login buttons are available on the login screen.

## What's included

### Data (generated on first load)
- 412 providers
- 176 purchasers
- 12,719 invoices across all 7 lifecycle states
- 3 currencies: UGX, Uganda Shillings | USD, US Dollars | LYD, Libyan Dinar
- 50 goods & service categories
- Realistic payment histories and notification events

### Features
- **Authentication** — email + password login with role detection
- **Provider dashboard** — invoice volume charts, status breakdown, recent activity
- **Purchaser dashboard** — balance by currency, overdue alerts, invoices needing action
- **Admin dashboard** — platform-wide stats, category/currency management, user management
- **Invoice list** — search, filter by status/currency/overdue, sort, paginate (50 per page)
- **Invoice detail** — full line items, payment history, acknowledge / pay / default / cancel actions
- **New invoice form** — dynamic line items, category picker, currency, assign to purchaser or save as draft
- **Notifications** — per-user notification panel with unread indicators and mark-all-read
- **Toast alerts** — real-time feedback on every action

### Project structure
```
invoicebox/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── App.jsx                   # Root router
    ├── main.jsx                  # Entry point
    ├── index.css                 # Design system / global styles
    ├── data/
    │   └── seed.js               # Deterministic data generator (412+176+12k invoices)
    ├── hooks/
    │   └── useApp.jsx            # Global state, auth, all actions
    ├── utils/
    │   └── helpers.jsx           # Formatting, Badge, Avatar, Pagination
    ├── components/
    │   ├── AppShell.jsx          # Sidebar, topbar, notification panel
    │   ├── InvoiceModal.jsx      # Invoice detail / payment / default modal
    │   └── ToastStack.jsx        # Toast notification renderer
    └── pages/
        ├── LoginPage.jsx         # Login screen with demo account buttons
        ├── DashboardPages.jsx    # Provider + Purchaser dashboards
        ├── InvoicesPage.jsx      # Invoice list with filters & pagination
        ├── NewInvoicePage.jsx    # Invoice creation form
        └── AdminPages.jsx        # Admin dashboard, users, settings
```

## Build for production
```bash
npm run build
# Output goes to dist/ — deploy to any static host (Netlify, Vercel, etc.)
```
