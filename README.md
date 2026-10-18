# 💰 Expense Tracker

A simple web app to track your income and expenses — add transactions, see your live balance, and get a visual category-wise spending breakdown.

## Features

- ➕ Add income / expense entries with category, note and date
- 📊 Live balance, income and expense cards
- 📉 Spending breakdown by category (visual bars)
- 🧾 Transaction history with one-click delete
- 💾 Data saved in a local JSON file — no database setup needed

## Tech stack

- **Backend:** Node.js + Express (REST API)
- **Frontend:** HTML, CSS, vanilla JavaScript
- **Storage:** JSON file (`data.json`, auto-created)

## Run it

```bash
npm install
npm start
```

Open **http://localhost:3000** in your browser.

## API

| Method | Endpoint                  | Description                              |
| ------ | ------------------------- | ---------------------------------------- |
| GET    | `/api/transactions`       | List all transactions (newest first)     |
| POST   | `/api/transactions`       | Add one `{type, amount, category, note?, date?}` |
| DELETE | `/api/transactions/:id`   | Delete a transaction                     |
| GET    | `/api/summary`            | Totals + per-category expense breakdown  |

## Project structure

```
expense-tracker/
├── server.js          # Express server + API
├── package.json
├── public/
│   ├── index.html     # UI
│   ├── style.css      # Styling
│   └── app.js         # Frontend logic (fetch API)
└── data.json          # Auto-created on first run (gitignored)
```

## Ideas to extend

- Monthly filter and charts (Chart.js)
- Export to CSV
- Budget limits per category with alerts
