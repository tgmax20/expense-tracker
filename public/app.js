// Expense Tracker — frontend logic
const EXPENSE_CATS = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];
const INCOME_CATS = ['Salary', 'Freelance', 'Business', 'Other'];
let currentType = 'expense';

const $ = (id) => document.getElementById(id);
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

// Fill the category dropdown based on income/expense toggle
function fillCategories() {
  const cats = currentType === 'expense' ? EXPENSE_CATS : INCOME_CATS;
  $('category').innerHTML = cats.map((c) => `<option>${c}</option>`).join('');
}

document.querySelectorAll('.type-toggle button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-toggle button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentType = btn.dataset.type;
    fillCategories();
  });
});

// Re-render everything from the API
async function refresh() {
  const [txs, sum] = await Promise.all([
    fetch('/api/transactions').then((r) => r.json()),
    fetch('/api/summary').then((r) => r.json()),
  ]);

  $('balance').textContent = fmt(sum.balance);
  $('income').textContent = fmt(sum.income);
  $('expense').textContent = fmt(sum.expense);

  // Category breakdown bars (biggest first)
  const cats = Object.entries(sum.byCategory).sort((a, b) => b[1] - a[1]);
  const max = cats.length ? cats[0][1] : 1;
  $('categories').innerHTML = cats.length
    ? cats.map(([c, v]) => `
      <div class="cat-row">
        <span class="cat-name">${c}</span>
        <div class="bar"><div class="fill" style="width:${Math.round((v / max) * 100)}%"></div></div>
        <span class="cat-amt">${fmt(v)}</span>
      </div>`).join('')
    : '<p class="empty">No expenses yet.</p>';

  // Transaction history
  $('tx-list').innerHTML = txs.length
    ? txs.map((t) => `
      <li class="${t.type}">
        <div><strong>${t.category}</strong><small>${t.note ? t.note + ' · ' : ''}${t.date}</small></div>
        <div class="right">
          <span class="amt">${t.type === 'income' ? '+' : '−'}${fmt(t.amount)}</span>
          <button onclick="delTx('${t.id}')" title="Delete">✕</button>
        </div>
      </li>`).join('')
    : '<li><p class="empty">No transactions yet.</p></li>';
}

async function delTx(id) {
  await fetch('/api/transactions/' + id, { method: 'DELETE' });
  refresh();
}

$('tx-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: currentType,
      amount: $('amount').value,
      category: $('category').value,
      note: $('note').value.trim(),
      date: $('date').value || undefined,
    }),
  });
  if (!res.ok) {
    alert((await res.json()).error || 'Failed to add');
    return;
  }
  e.target.reset();
  $('date').value = new Date().toISOString().slice(0, 10);
  fillCategories();
  refresh();
});

// init
$('date').value = new Date().toISOString().slice(0, 10);
fillCategories();
refresh();
