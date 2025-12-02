const SHEET_URL = "TU_WEB_APP_URL_AQUI"; // pon tu URL de Apps Script

async function cargarDatos() {
  const res = await fetch(SHEET_URL);
  const data = await res.json();
  const tbody = document.querySelector("#tablaPedidos tbody");
  tbody.innerHTML = "";

  let stockLabels = [], stockData = [], stockMinData = [], urgentes = 0;

  data.slice(1).forEach(row => {
    const [pieza, stock, stockMin, cantidadPedir, proveedor, email, deadline, status] = row;
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${pieza}</td>
      <td>${stock}</td>
      <td>${stockMin}</td>
      <td>${cantidadPedir}</td>
      <td>${proveedor}</td>
      <td>${email}</td>
      <td>${new Date(deadline).toLocaleDateString()}</td>
      <td class="${status.includes('Enviado') ? 'status-enviado' : status.includes('Urgente') ? 'status-urgente' : 'status-retrasado'}">${status}</td>
      <td><button onclick="enviarPedido('${pieza}')">Enviar Pedido</button></td>
    `;
    tbody.appendChild(tr);

    stockLabels.push(pieza);
    stockData.push(stock);
    stockMinData.push(stockMin);
    if(status.includes('Urgente')) urgentes++;
  });

  document.getElementById("alertas").innerText = `⚠️ Pedidos urgentes: ${urgentes}`;

  // Gráfico de stock
  const ctx = document.getElementById('chartStock').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: stockLabels,
      datasets: [
        {label: 'Stock Actual', data: stockData, backgroundColor: '#4a86e8'},
        {label: 'Stock Mínimo', data: stockMinData, backgroundColor: '#ea9999'}
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } } }
  });
}

async function enviarPedido(pieza) {
  const cantidad = prompt(`Ingrese cantidad a pedir para ${pieza}:`);
  if(!cantidad) return;

  const res = await fetch(SHEET_URL, {
    method: 'POST',
    body: JSON.stringify({pieza, cantidad}),
  });
  await res.json();
  alert(`✅ Pedido enviado para ${pieza}`);
  cargarDatos(); // recarga tabla y gráfico
}

// Cargar datos al inicio
cargarDatos();
