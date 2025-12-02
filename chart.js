// ======================
// Datos inventados
// ======================

const inventario = [
    { producto: "Producto A", stock: 120, committed: 35, expected: 50 },
    { producto: "Producto B", stock: 80, committed: 10, expected: 15 },
    { producto: "Producto C", stock: 45, committed: 20, expected: 10 }
];

// Valores globales
document.getElementById("stock").textContent =
    inventario.reduce((s, x) => s + x.stock, 0);

document.getElementById("committed").textContent =
    inventario.reduce((s, x) => s + x.committed, 0);

document.getElementById("expected").textContent =
    inventario.reduce((s, x) => s + x.expected, 0);

// ======================
// Tabla dinámica
// ======================

const tbody = document.getElementById("table-body");

inventario.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${row.producto}</td>
        <td>${row.stock}</td>
        <td>${row.committed}</td>
        <td>${row.expected}</td>
    `;
    tbody.appendChild(tr);
});

// ======================
// Gráfico
// ======================

const etiquetas = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"];

const demandaReal = [80, 95, 110, 120, 115, 130, 140, 135];
const forecast =     [75, 90, 100, 110, 120, 125, 130, 140];

new Chart(document.getElementById("demandChart"), {
    type: "line",
    data: {
        labels: etiquetas,
        datasets: [
            {
                label: "Demanda Real",
                data: demandaReal,
                borderColor: "red",
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 5,
                pointHoverRadius: 9,
                pointBackgroundColor: "white"
            },
            {
                label: "Forecast",
                data: forecast,
                borderColor: "#4fc3f7",
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 5,
                pointHoverRadius: 9,
                pointBackgroundColor: "white"
            }
        ]
    },
    options: {
        plugins: {
            legend: { labels: { color: "white" } },
            tooltip: { enabled: true }
        },
        scales: {
            x: { ticks: { color: "white" }},
            y: { ticks: { color: "white" }}
        }
    }
});




