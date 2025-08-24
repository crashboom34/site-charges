document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('charges-table');
  const form = document.getElementById('charge-form');
  const typeInput = document.getElementById('type');
  const amountInput = document.getElementById('amount');
  const totalCell = document.getElementById('total-cell');

  function updateTotal() {
    let total = 0;
    tableBody.querySelectorAll('tr').forEach(row => {
      const amountText = row.querySelector('td:nth-child(2)').textContent;
      const value = parseFloat(amountText);
      if (!isNaN(value)) total += value;
    });
    totalCell.textContent = `${total.toFixed(2)} €`;
  }

  function addRow(type, amount) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${type}</td><td>${amount.toFixed(2)} €</td><td><button class="delete">Supprimer</button></td>`;
    tableBody.appendChild(tr);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const type = typeInput.value.trim();
    const amount = parseFloat(amountInput.value);
    if (type && !isNaN(amount)) {
      addRow(type, amount);
      updateTotal();
      form.reset();
    }
  });

  tableBody.addEventListener('click', e => {
    if (e.target.classList.contains('delete')) {
      e.target.closest('tr').remove();
      updateTotal();
    } else if (e.target.tagName === 'TD') {
      const row = e.target.parentElement;
      tableBody.querySelectorAll('tr').forEach(r => r.classList.remove('active'));
      row.classList.add('active');
    }
  });

  updateTotal();
});

