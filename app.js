const SHEET_URL = "https://script.google.com/u/0/home/projects/1wVNkVq5iRmboGi8x5o5LQVRUXOVnosHLVUQSbeeawrSpt8EDR4CiFBef/edit"; // pega tu Web App URL

async function cargarDatos() {
  const res = await fetch(SHEET_URL);
  const data = await res.json();
  const tbody = document.querySelector("#tablaPedidos tbody");
  tbody.innerHTML = "";

  let stockLabels = [], stockData = [], stockMinData = [], statusCount = {Urgente:0, Enviado:0, Retrasado:0};
  let stockCritico = 0;

  data.slice(1).forEach(row => {
    const [pieza, stock, stockMin, cantidadPedir, proveedor, email, deadline, status] = row;
    const tr = document.createElement("tr");

    let statusClass = status.includes('Enviado') ? 'status-enviado' :
                      status.includes('Urgente') ? 'status-urgente' : 'status-retrasado';

    if(status.includes('Urgente')) statusCount.Urgente++;
    if(status.includes('Enviado')) statusCount.Enviado++;
    if(stock < stockMin) stockCritico++;

    tr.innerHTML = `
      <td class="px-2 py-1">${pieza}</td>
      <td class="px-2 py-1">${stock}</td>
      <td class="px-2 py-1">${stockMin}</td>
      <td class="px-2 py-1">${cantidadPedir}</td>
      <td class="px-2 py-1">${proveedor}</td>
      <td class="px-2 py-1">${email}</td>
      <td class="px-2 py-1">${new Date(deadline).toLocaleDateString()}</td>
      <td class="px-2 py-1 ${statusClass}">${status}</td>
      <td class="px-2 py-1"><button onclick="enviarPedido('${pieza}')">Enviar</button></td>
    `;
    tbody.appendChild(tr);

    stockLabels.push(pieza);
    stockData.push(stock);
    stockMinData.push(stockMin);
  });

  // KPIs
  document.getElementById("num-urgentes").innerText = statusCount.Urgente;
  document.getElementById("num-critico").innerText = stockCritico;
  document.getElementById("num-confiables").innerText = statusCount.Enviado;

  // Gráfico de Stock
  const ctxStock = document.getElementById('chartStock').getContext('2d');
  new Chart(ctxStock, {
    type: 'bar',
    data: {
      labels: stockLabels,
      datasets: [
        {label: 'Stock Actual', data: stockData, backgroundColor: '#4a86e8'},
        {label: 'Stock Mínimo', data: stockMinData, backgroundColor: '#ea9999'}
      ]
    },
    options: { responsive:true, plugins:{legend:{position:'top'}} }
  });

  // Gráfico de Status
  const ctxStatus = document.getElementById('chartStatus').getContext('2d');
  new Chart(ctxStatus, {
    type: 'pie',
    data: {
      labels: ['Enviado','Urgente','Retrasado'],
      datasets:[{
        data: [statusCount.Enviado, statusCount.Urgente, statusCount.Retrasado],
        backgroundColor: ['#b6d7a8','#ffe599','#ea9999']
      }]
    },
    options:{ responsive:true }
  });
}

async function enviarPedido(pieza) {
  const cantidad = prompt(`Ingrese cantidad a pedir para ${pieza}:`);
  if(!cantidad) return;

  await fetch(SHEET_URL, {
    method: 'POST',
    body: JSON.stringify({pieza, cantidad})
  });

  alert(`✅ Pedido enviado para ${pieza}`);
  cargarDatos();
}

// Cargar datos al inicio
cargarDatos();

