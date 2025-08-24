const chargesSalariales = 0.23;
const chargesPatronales = 0.42;

function calculateEmployerCost(net) {
  const brut = net / (1 - chargesSalariales);
  const employer = brut * (1 + chargesPatronales);
  const charges = employer - brut;
  return { brut, employer, charges };
}

function InfoPanel() {
  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
      <p className="mb-2">
        Ce calculateur estime les charges salariales ({(chargesSalariales * 100).toFixed(0)}%) et
        patronales ({(chargesPatronales * 100).toFixed(0)}%) pour chaque salarié afin de
        déterminer le coût employeur.
      </p>
      <p>
        Les résultats sont indicatifs&nbsp;: adaptez les taux et frais généraux selon
        votre situation et vos conventions collectives.
      </p>
    </div>
  );
}

function Overview({ chantiers }) {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);

  const totals = React.useMemo(() => {
    return chantiers.reduce(
      (acc, c) => {
        const worker = c.workers.reduce((s, w) => s + w.total, 0);
        const materials = c.materials.reduce((s, m) => s + m.total, 0);
        const overhead = (worker + materials) * (c.overhead / 100);
        return {
          worker: acc.worker + worker,
          materials: acc.materials + materials,
          overhead: acc.overhead + overhead,
        };
      },
      { worker: 0, materials: 0, overhead: 0 }
    );
  }, [chantiers]);

  const total = totals.worker + totals.materials + totals.overhead;

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Main d\'oeuvre', 'Matériaux', 'Frais généraux'],
        datasets: [
          {
            data: [totals.worker, totals.materials, totals.overhead],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
          },
        ],
      },
    });
  }, [totals]);

  if (total === 0) return null;

  return (
    <div className="mb-4 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2">Résumé global</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 text-sm">
        <p>Main d'oeuvre: {totals.worker.toFixed(2)} €</p>
        <p>Matériaux: {totals.materials.toFixed(2)} €</p>
        <p>Frais généraux: {totals.overhead.toFixed(2)} €</p>
        <p className="font-bold">Total: {total.toFixed(2)} €</p>
      </div>
      <canvas ref={canvasRef} height="80"></canvas>
    </div>
  );
}

function ChantierForm({ onAdd }) {
  const [name, setName] = React.useState('');
  const [overhead, setOverhead] = React.useState(10);
  const [sale, setSale] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onAdd({
      id: Date.now(),
      name,
      overhead: parseFloat(overhead) || 0,
      sale: sale ? parseFloat(sale) : null,
      workers: [],
      materials: [],
    });
    setName('');
    setOverhead(10);
    setSale('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2">Ajouter un chantier</h2>
      <div className="flex flex-wrap gap-2">
        <input className="border border-gray-300 rounded p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du chantier" required />
        <input type="number" className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500" value={overhead} onChange={(e) => setOverhead(e.target.value)} placeholder="Frais généraux %" />
        <input type="number" className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500" value={sale} onChange={(e) => setSale(e.target.value)} placeholder="Prix de vente" />
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition-colors">Ajouter</button>
      </div>
    </form>
  );
}

function WorkerForm({ chantiers, onAdd }) {
  const [chantierId, setChantierId] = React.useState('');
  const [name, setName] = React.useState('');
  const [net, setNet] = React.useState('');
  const [hours, setHours] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const netVal = parseFloat(net);
    const hoursVal = parseFloat(hours);
    if (!chantierId || !name || isNaN(netVal) || isNaN(hoursVal)) return;
    onAdd(parseInt(chantierId), { name, net: netVal, hours: hoursVal });
    setName('');
    setNet('');
    setHours('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2">Ajouter un salarié</h2>
      <div className="flex flex-wrap gap-2">
        <select className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={chantierId} onChange={(e) => setChantierId(e.target.value)} required>
          <option value="">Chantier</option>
          {chantiers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" required />
        <input type="number" className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500" value={net} onChange={(e) => setNet(e.target.value)} placeholder="Net €/h" required />
        <input type="number" className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Heures" required />
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow transition-colors">Ajouter</button>
      </div>
    </form>
  );
}

function MaterialForm({ chantiers, onAdd }) {
  const [chantierId, setChantierId] = React.useState('');
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [quantity, setQuantity] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const priceVal = parseFloat(price);
    const qtyVal = parseFloat(quantity);
    if (!chantierId || !name || isNaN(priceVal) || isNaN(qtyVal)) return;
    onAdd(parseInt(chantierId), { name, price: priceVal, quantity: qtyVal });
    setName('');
    setPrice('');
    setQuantity('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2">Ajouter un matériau</h2>
      <div className="flex flex-wrap gap-2">
        <select className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={chantierId} onChange={(e) => setChantierId(e.target.value)} required>
          <option value="">Chantier</option>
          {chantiers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" required />
        <input type="number" className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Prix" required />
        <input type="number" className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantité" required />
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded shadow transition-colors">Ajouter</button>
      </div>
    </form>
  );
}

function Chantier({ chantier, onExportPDF, onExportCSV }) {
  const workerCost = chantier.workers.reduce((s, w) => s + w.total, 0);
  const materialsCost = chantier.materials.reduce((s, m) => s + m.total, 0);
  const subtotal = workerCost + materialsCost;
  const total = subtotal * (1 + chantier.overhead / 100);
  const margin = chantier.sale != null ? chantier.sale - total : null;
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Main d\'oeuvre', 'Matériaux', 'Frais généraux'],
        datasets: [{
          label: '€',
          data: [workerCost, materialsCost, total - subtotal],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        }],
      },
    });
  }, [workerCost, materialsCost, total]);

  return (
    <div className="mb-8 p-4 bg-white shadow-lg rounded-lg">
      <h3 className="text-lg font-bold">{chantier.name}</h3>
      <p className="mb-2">Frais généraux: {chantier.overhead}%</p>
      <table className="w-full mb-4 text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-left"><th className="p-1">Type</th><th className="p-1">Détails</th><th className="p-1">Total €</th></tr>
        </thead>
        <tbody>
          {chantier.workers.map((w, i) => (
            <tr key={'w'+i}>
              <td className="p-1">Salarié</td>
              <td className="p-1">{w.name} - Net: {w.net.toFixed(2)} €/h, Brut: {w.brut.toFixed(2)} €, Charges: {w.charges.toFixed(2)} €, Coût: {w.employer.toFixed(2)} €/h x {w.hours}h</td>
              <td className="p-1">{w.total.toFixed(2)}</td>
            </tr>
          ))}
          {chantier.materials.map((m, i) => (
            <tr key={'m'+i}>
              <td className="p-1">Matériau</td>
              <td className="p-1">{m.name} ({m.quantity} x {m.price.toFixed(2)} €)</td>
              <td className="p-1">{m.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold"><td className="p-1">Total M.O.</td><td></td><td className="p-1">{workerCost.toFixed(2)}</td></tr>
          <tr className="font-bold"><td className="p-1">Total Matériaux</td><td></td><td className="p-1">{materialsCost.toFixed(2)}</td></tr>
          <tr className="font-bold"><td className="p-1">Sous-total</td><td></td><td className="p-1">{subtotal.toFixed(2)}</td></tr>
          <tr className="font-bold"><td className="p-1">Total avec frais généraux</td><td></td><td className="p-1">{total.toFixed(2)}</td></tr>
          {margin !== null && <tr className="font-bold"><td className="p-1">Marge brute</td><td></td><td className="p-1">{margin.toFixed(2)}</td></tr>}
        </tfoot>
      </table>
      <div className="mb-2">
        <canvas ref={canvasRef} height="80"></canvas>
      </div>
      <button onClick={onExportPDF} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 mr-2 rounded shadow transition-colors">Export PDF</button>
      <button onClick={onExportCSV} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded shadow transition-colors">Export CSV</button>
    </div>
  );
}

function App() {
  const [chantiers, setChantiers] = React.useState(() => {
    const saved = localStorage.getItem('chantiers');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('chantiers', JSON.stringify(chantiers));
  }, [chantiers]);

  const addChantier = (chantier) => setChantiers([...chantiers, chantier]);

  const addWorker = (chantierId, worker) => {
    setChantiers(chantiers.map(c => {
      if (c.id !== chantierId) return c;
      const { brut, employer, charges } = calculateEmployerCost(worker.net);
      const total = employer * worker.hours;
      const newWorker = { ...worker, brut, employer, charges, total };
      return { ...c, workers: [...c.workers, newWorker] };
    }));
  };

  const addMaterial = (chantierId, material) => {
    setChantiers(chantiers.map(c => {
      if (c.id !== chantierId) return c;
      const total = material.price * material.quantity;
      const newMaterial = { ...material, total };
      return { ...c, materials: [...c.materials, newMaterial] };
    }));
  };

  const exportPDF = (chantier) => {
    const { jsPDF } = window.jspdf;
    const workerCost = chantier.workers.reduce((s, w) => s + w.total, 0);
    const materialsCost = chantier.materials.reduce((s, m) => s + m.total, 0);
    const subtotal = workerCost + materialsCost;
    const total = subtotal * (1 + chantier.overhead / 100);
    const margin = chantier.sale != null ? chantier.sale - total : null;
    const doc = new jsPDF();
    let y = 10;
    doc.text(`Chantier: ${chantier.name}`, 10, y); y += 10;
    chantier.workers.forEach(w => { doc.text(`Salarié ${w.name}: ${w.total.toFixed(2)} €`, 10, y); y += 8; });
    chantier.materials.forEach(m => { doc.text(`Matériau ${m.name}: ${m.total.toFixed(2)} €`, 10, y); y += 8; });
    doc.text(`Total M.O.: ${workerCost.toFixed(2)} €`, 10, y); y += 8;
    doc.text(`Total Matériaux: ${materialsCost.toFixed(2)} €`, 10, y); y += 8;
    doc.text(`Total avec frais généraux: ${total.toFixed(2)} €`, 10, y); y += 8;
    if (margin !== null) { doc.text(`Marge brute: ${margin.toFixed(2)} €`, 10, y); }
    doc.save(`${chantier.name}.pdf`);
  };

  const exportCSV = (chantier) => {
    const workerCost = chantier.workers.reduce((s, w) => s + w.total, 0);
    const materialsCost = chantier.materials.reduce((s, m) => s + m.total, 0);
    const subtotal = workerCost + materialsCost;
    const total = subtotal * (1 + chantier.overhead / 100);
    const margin = chantier.sale != null ? chantier.sale - total : null;
    let rows = [];
    chantier.workers.forEach(w => rows.push(['Salarie', w.name, w.total.toFixed(2)]));
    chantier.materials.forEach(m => rows.push(['Materiau', m.name, m.total.toFixed(2)]));
    rows.push(['Total MO', '', workerCost.toFixed(2)]);
    rows.push(['Total Materiaux', '', materialsCost.toFixed(2)]);
    rows.push(['Total avec FG', '', total.toFixed(2)]);
    if (margin !== null) rows.push(['Marge brute', '', margin.toFixed(2)]);
    const csvContent = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${chantier.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Calculateur de coûts BTP</h1>
      <InfoPanel />
      <Overview chantiers={chantiers} />
      <ChantierForm onAdd={addChantier} />
      <WorkerForm chantiers={chantiers} onAdd={addWorker} />
      <MaterialForm chantiers={chantiers} onAdd={addMaterial} />
      {chantiers.map(c => (
        <Chantier key={c.id} chantier={c} onExportPDF={() => exportPDF(c)} onExportCSV={() => exportCSV(c)} />
      ))}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
