// Valores ficticios
document.getElementById("stock").textContent = 120;
document.getElementById("committed").textContent = 35;
document.getElementById("expected").textContent = 50;

const tableData = [
    { producto: "Producto A", stock: 120, committed: 35, expected: 50 },
    { producto: "Producto B", stock: 80, committed: 10, expected: 15 },
    { producto: "Producto C", stock: 45, committed: 20, expected: 10 }
];

const tbody = document.getElementById("table-body");

tableData.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${row.producto}</td>
        <td>${row.stock}</td>
        <td>${row.committed}</td>
        <td>${row.expected}</td>
    `;
    tbody.appendChild(tr);
});

// DEMANDA REAL + FORECAST (Inventado)
const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"];

const demandaReal = [80, 95, 110, 120, 115, 130, 140, 135];
const forecast =     [75, 90, 100, 110, 120, 125, 130, 140];

const ctx = document.getElementById("demandChart").getContext("2d");

new Chart(ctx, {
    type: "line",
    data: {
        labels: labels,
        datasets: [
            {
                label: "Demanda Real",
                data: demandaReal,
                borderWidth: 3,
                borderColor: "red",
                tension: 0.35,
                pointRadius: 5,
                pointHoverRadius: 9,
                pointBackgroundColor: "white"
            },
            {
                label: "Forecast",
                data: forecast,
                borderWidth: 3,
                borderColor: "#40c4ff",
                tension: 0.35,
                pointRadius: 5,
                pointHoverRadius: 9,
                pointBackgroundColor: "white"
            }
        ],
    },
    options: {
        responsive: true,
        plugins: {
            legend: { labels: { color: "white" }},
            tooltip: { enabled: true }
        },
        scales: {
            x: { ticks: { color: "white" }},
            y: { ticks: { color: "white" }}
        }
    }
});



