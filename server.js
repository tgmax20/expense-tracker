// Expense Tracker — backend server
// Run:  npm install && npm start
// Open: http://localhost:3000

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- tiny JSON "database" ----------
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return []; // no file yet -> start with an empty list
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ---------- API ----------

// GET /api/transactions — all transactions, newest first
app.get('/api/transactions', (req, res) => {
  const data = loadData().sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(data);
});

// POST /api/transactions — add a transaction
// body: { type: "income"|"expense", amount, category, note?, date? }
app.post('/api/transactions', (req, res) => {
  const { type, amount, category, note, date } = req.body;

  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'type must be "income" or "expense"' });
  }
  const amt = Number(amount);
  if (!amt || amt <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  if (!category) {
    return res.status(400).json({ error: 'category is required' });
  }

  const data = loadData();
  const tx = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    type,
    amount: amt,
    category,
    note: note || '',
    date: date || new Date().toISOString().slice(0, 10),
  };
  data.push(tx);
  saveData(data);
  res.status(201).json(tx);
});

// DELETE /api/transactions/:id — remove a transaction
app.delete('/api/transactions/:id', (req, res) => {
  const data = loadData().filter((t) => t.id !== req.params.id);
  saveData(data);
  res.json({ ok: true });
});

// GET /api/summary — totals + per-category expense breakdown
app.get('/api/summary', (req, res) => {
  const data = loadData();
  let income = 0;
  let expense = 0;
  const byCategory = {};

  for (const t of data) {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
  }

  res.json({
    income,
    expense,
    balance: income - expense,
    byCategory,
    count: data.length,
  });
});

app.listen(PORT, () => {
  console.log(`Expense Tracker running at http://localhost:${PORT}`);
});
