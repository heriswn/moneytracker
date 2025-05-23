document.getElementById('transaction-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const desc = document.getElementById('description').value;
  const amt = Number(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: desc, amount: amt, type }),
  });

  loadTransactions();
});

async function loadTransactions() {
  const res = await fetch('/api/transactions');
  const data = await res.json();

  const list = document.getElementById('transaction-list');
  list.innerHTML = '';

  let total = 0;
  data.forEach((t) => {
    const li = document.createElement('li');
    li.textContent = `${t.description} - ${t.amount} (${t.type})`;
    list.appendChild(li);
    total += t.type === 'income' ? t.amount : -t.amount;
  });

  document.getElementById('total').textContent = total;
}

loadTransactions();
