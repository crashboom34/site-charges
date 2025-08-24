const chargesSalariales = 0.23;
const chargesPatronales = 0.42;
// Nombre d'heures de travail standard dans un mois (35h/semaine)
const hoursPerMonth = 151.67;

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
    <div className="mb-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Résumé global</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-blue-800">Main d'oeuvre</p>
          <p className="text-lg font-semibold">{totals.worker.toFixed(2)} €</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <p className="text-sm text-green-800">Matériaux</p>
          <p className="text-lg font-semibold">{totals.materials.toFixed(2)} €</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg text-center">
          <p className="text-sm text-yellow-800">Frais généraux</p>
          <p className="text-lg font-semibold">{totals.overhead.toFixed(2)} €</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-sm text-gray-600 font-bold">Total</p>
          <p className="text-lg font-bold">{total.toFixed(2)} €</p>
        </div>
      </div>
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="max-w-xs" height="80"></canvas>
      </div>
    </div>
  );
}

function ChantierForm({ chantiers, onAdd }) {
  const [name, setName] = React.useState('');
  const [overhead, setOverhead] = React.useState(10);
  const [sale, setSale] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  const duplicate = React.useMemo(
    () => chantiers.some((c) => c.name.toLowerCase() === name.toLowerCase()),
    [chantiers, name]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || duplicate) return;
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    onAdd({
      id: Date.now(),
      name,
      overhead: parseFloat(overhead) || 0,
      sale: sale ? parseFloat(sale) : null,
      workers: [],
      materials: [],
      date: formattedDate,
    });
    setName('');
    setOverhead(10);
    setSale('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const isValid = name && !duplicate && date;

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2">Ajouter un chantier</h2>
      <div className="flex flex-wrap gap-2">
        <input
          className="border border-gray-300 rounded p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du chantier"
          required
        />
        <input
          type="number"
          className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={overhead}
          min="0"
          step="0.1"
          onChange={(e) => setOverhead(e.target.value)}
          placeholder="Frais généraux %"
        />
        <input
          type="number"
          className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sale}
          onChange={(e) => setSale(e.target.value)}
          placeholder="Prix de vente"
        />
        <input
          type="date"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button
          disabled={!isValid}
          className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition-colors ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Ajouter
        </button>
      </div>
      {duplicate && (
        <p className="text-red-600 text-sm mt-2">Un chantier avec ce nom existe déjà.</p>
      )}
    </form>
  );
}

function WorkerForm({ chantiers, onAdd }) {
  const [chantierId, setChantierId] = React.useState('');
  const [name, setName] = React.useState('');
  const [net, setNet] = React.useState('');
  const [hours, setHours] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  const netVal = parseFloat(net);
  const hoursVal = parseFloat(hours);

  const preview = React.useMemo(() => {
    if (isNaN(netVal) || isNaN(hoursVal)) return null;
    const { brut, employer, charges } = calculateEmployerCost(netVal);
    const total = (employer / hoursPerMonth) * hoursVal;
    return { brut, employer, charges, total };
  }, [netVal, hoursVal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!chantierId || !name || isNaN(netVal) || isNaN(hoursVal)) return;
    onAdd(parseInt(chantierId), { name, net: netVal, hours: hoursVal, date });
    setName('');
    setNet('');
    setHours('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const isValid = chantierId && name && !isNaN(netVal) && !isNaN(hoursVal) && date;

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
          <input
            type="number"
            className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={net}
            onChange={(e) => setNet(e.target.value)}
            placeholder="Net €/mois"
            required
          />
          <input
            type="number"
            className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Heures sur chantier"
            required
          />
        <input
          type="date"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button
          disabled={!isValid}
          className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow transition-colors ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Ajouter
        </button>
      </div>
        {preview && (
          <p className="text-sm mt-2 text-gray-700">
            Brut: {preview.brut.toFixed(2)} €/mois - Charges: {preview.charges.toFixed(2)} €/mois - Coût employeur: {preview.employer.toFixed(2)} €/mois - Coût chantier: {preview.total.toFixed(2)} €
          </p>
        )}
      </form>
    );
  }

function MaterialForm({ chantiers, onAdd }) {
  const [chantierId, setChantierId] = React.useState('');
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  const priceVal = parseFloat(price);
  const qtyVal = parseFloat(quantity);

  const total = !isNaN(priceVal) && !isNaN(qtyVal) ? priceVal * qtyVal : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!chantierId || !name || isNaN(priceVal) || isNaN(qtyVal)) return;
    onAdd(parseInt(chantierId), { name, price: priceVal, quantity: qtyVal, date });
    setName('');
    setPrice('');
    setQuantity('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const isValid = chantierId && name && !isNaN(priceVal) && !isNaN(qtyVal) && date;

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
        <input
          type="number"
          className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Prix"
          required
        />
        <input
          type="number"
          className="border border-gray-300 rounded p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantité"
          required
        />
        <input
          type="date"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button
          disabled={!isValid}
          className={`bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded shadow transition-colors ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Ajouter
        </button>
      </div>
      {total !== null && (
        <p className="text-sm mt-2 text-gray-700">Coût total: {total.toFixed(2)} €</p>
      )}
    </form>
  );
}

function Chantier({ chantier, onExportPDF, onExportCSV, onDeleteChantier, onEditChantier, onDeleteWorker, onEditWorker, onDeleteMaterial, onEditMaterial }) {
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">{chantier.name}</h3>
          <p className="text-sm text-gray-600">Ajouté le {chantier.date}</p>
        </div>
        <div>
          <button onClick={onEditChantier} className="text-blue-500 mr-2">Modifier</button>
          <button onClick={onDeleteChantier} className="text-red-500">Supprimer</button>
        </div>
      </div>
      <p className="mb-2">Frais généraux: {chantier.overhead}%</p>
      <table className="w-full mb-4 text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-left"><th className="p-1">Type</th><th className="p-1">Détails</th><th className="p-1">Total €</th><th className="p-1">Actions</th></tr>
        </thead>
        <tbody>
          {chantier.workers.map((w, i) => (
            <tr key={'w'+i}>
              <td className="p-1">Salarié</td>
              <td className="p-1">{w.name} - Net: {w.net.toFixed(2)} €/mois, Brut: {w.brut.toFixed(2)} €, Charges: {w.charges.toFixed(2)} €, Coût employeur: {w.employer.toFixed(2)} €/mois ({(w.employer / hoursPerMonth).toFixed(2)} €/h x {w.hours}h) - Ajouté le {w.date}</td>
              <td className="p-1">{w.total.toFixed(2)}</td>
              <td className="p-1">
                <button onClick={() => onEditWorker(i)} className="text-blue-500 mr-1">Modifier</button>
                <button onClick={() => onDeleteWorker(i)} className="text-red-500">Supprimer</button>
              </td>
            </tr>
          ))}
          {chantier.materials.map((m, i) => (
            <tr key={'m'+i}>
              <td className="p-1">Matériau</td>
              <td className="p-1">{m.name} ({m.quantity} x {m.price.toFixed(2)} €) - Ajouté le {m.date}</td>
              <td className="p-1">{m.total.toFixed(2)}</td>
              <td className="p-1">
                <button onClick={() => onEditMaterial(i)} className="text-blue-500 mr-1">Modifier</button>
                <button onClick={() => onDeleteMaterial(i)} className="text-red-500">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold"><td className="p-1">Total M.O.</td><td></td><td className="p-1">{workerCost.toFixed(2)}</td><td></td></tr>
          <tr className="font-bold"><td className="p-1">Total Matériaux</td><td></td><td className="p-1">{materialsCost.toFixed(2)}</td><td></td></tr>
          <tr className="font-bold"><td className="p-1">Sous-total</td><td></td><td className="p-1">{subtotal.toFixed(2)}</td><td></td></tr>
          <tr className="font-bold"><td className="p-1">Total avec frais généraux</td><td></td><td className="p-1">{total.toFixed(2)}</td><td></td></tr>
          {margin !== null && <tr className="font-bold"><td className="p-1">Marge brute</td><td></td><td className="p-1">{margin.toFixed(2)}</td><td></td></tr>}
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
      const total = (employer / hoursPerMonth) * worker.hours;
      const formattedDate = new Date(worker.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const newWorker = { ...worker, date: formattedDate, brut, employer, charges, total };
      return { ...c, workers: [...c.workers, newWorker] };
    }));
  };

  const addMaterial = (chantierId, material) => {
    setChantiers(chantiers.map(c => {
      if (c.id !== chantierId) return c;
      const total = material.price * material.quantity;
      const formattedDate = new Date(material.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const newMaterial = { ...material, date: formattedDate, total };
      return { ...c, materials: [...c.materials, newMaterial] };
    }));
  };

  const deleteChantier = (id) => {
    setChantiers(chantiers.filter(c => c.id !== id));
  };

  const editChantier = (id) => {
    const c = chantiers.find(ch => ch.id === id);
    const name = prompt('Nom du chantier', c.name);
    if (!name) return;
    const overhead = parseFloat(prompt('Frais généraux (%)', c.overhead));
    const saleInput = prompt('Prix de vente', c.sale != null ? c.sale : '');
    setChantiers(chantiers.map(ch =>
      ch.id === id
        ? {
            ...ch,
            name,
            overhead: isNaN(overhead) ? ch.overhead : overhead,
            sale: saleInput ? parseFloat(saleInput) : null,
          }
        : ch
    ));
  };

  const deleteWorker = (chantierId, index) => {
    setChantiers(chantiers.map(c => {
      if (c.id !== chantierId) return c;
      const workers = c.workers.filter((_, i) => i !== index);
      return { ...c, workers };
    }));
  };

  const editWorker = (chantierId, index) => {
    const chantier = chantiers.find(c => c.id === chantierId);
    const w = chantier.workers[index];
    const name = prompt('Nom du salarié', w.name);
    if (!name) return;
    const net = parseFloat(prompt('Net €/mois', w.net));
    const hours = parseFloat(prompt('Heures sur chantier', w.hours));
    if (isNaN(net) || isNaN(hours)) return;
    const { brut, employer, charges } = calculateEmployerCost(net);
    const total = (employer / hoursPerMonth) * hours;
    setChantiers(chantiers.map(c => {
      if (c.id !== chantierId) return c;
      const workers = c.workers.map((wk, i) =>
        i === index ? { ...wk, name, net, hours, brut, employer, charges, total } : wk
      );
      return { ...c, workers };
    }));
  };

  const deleteMaterial = (chantierId, index) => {
    setChantiers(chantiers.map(c => {
      if (c.id !== chantierId) return c;
      const materials = c.materials.filter((_, i) => i !== index);
      return { ...c, materials };
    }));
  };

  const editMaterial = (chantierId, index) => {
    const chantier = chantiers.find(c => c.id === chantierId);
    const m = chantier.materials[index];
    const name = prompt('Nom du matériau', m.name);
    if (!name) return;
    const price = parseFloat(prompt('Prix', m.price));
    const quantity = parseFloat(prompt('Quantité', m.quantity));
    if (isNaN(price) || isNaN(quantity)) return;
    const total = price * quantity;
    setChantiers(chantiers.map(c => {
      if (c.id !== chantierId) return c;
      const materials = c.materials.map((mat, i) =>
        i === index ? { ...mat, name, price, quantity, total } : mat
      );
      return { ...c, materials };
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
      <ChantierForm chantiers={chantiers} onAdd={addChantier} />
      <WorkerForm chantiers={chantiers} onAdd={addWorker} />
      <MaterialForm chantiers={chantiers} onAdd={addMaterial} />
      {chantiers.map(c => (
        <Chantier
          key={c.id}
          chantier={c}
          onExportPDF={() => exportPDF(c)}
          onExportCSV={() => exportCSV(c)}
          onDeleteChantier={() => deleteChantier(c.id)}
          onEditChantier={() => editChantier(c.id)}
          onDeleteWorker={(i) => deleteWorker(c.id, i)}
          onEditWorker={(i) => editWorker(c.id, i)}
          onDeleteMaterial={(i) => deleteMaterial(c.id, i)}
          onEditMaterial={(i) => editMaterial(c.id, i)}
        />
      ))}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
