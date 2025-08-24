document.addEventListener('DOMContentLoaded', () => {
  const rows = document.querySelectorAll('#charges-table tr');
  rows.forEach(row => {
    row.addEventListener('click', () => {
      rows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');
    });
  });
});
