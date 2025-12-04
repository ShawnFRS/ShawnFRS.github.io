/* ============================================================
   GRÁFICO 1: Forecast vs Real
============================================================ */

const ctx1 = document.getElementById("forecastChart");

new Chart(ctx1, {
    type: "line",
    data: {
        labels: ["Lun", "Mar", "Mié", "Jue", "Vie"],
        datasets: [
            {
                label: "Forecast",
                data: [100, 120, 130, 140, 150],
                borderColor: "#072c3f",
                borderWidth: 2
            },
            {
                label: "Real",
                data: [95, 125, 128, 150, 145],
                borderColor: "#f55b5b",
                borderWidth: 2
            }
        ]
    },
    options: { responsive: true }
});


/* ============================================================
   GRÁFICO 2: Desviación %
============================================================ */

const ctx2 = document.getElementById("desviacionChart");

new Chart(ctx2, {
    type: "bar",
    data: {
        labels: ["Lun", "Mar", "Mié", "Jue", "Vie"],
        datasets: [{
            label: "Desviación %",
            data: [5, -4, 2, -7, 3],
            backgroundColor: "#072c3f"
        }]
    },
    options: { responsive: true }
});


/* ============================================================
   GRÁFICO 4: Cumplimiento por proveedor
============================================================ */

const ctx4 = document.getElementById("proveedorChart");

new Chart(ctx4, {
    type: "bar",
    data: {
        labels: ["Proveedor A", "Proveedor B", "Proveedor C"],
        datasets: [{
            label: "Cumplimiento",
            data: [95, 83, 76],
            backgroundColor: "#ffc847"
        }]
    },
    options: { responsive: true }
});


/* ============================================================
   GRÁFICO 3 (NUEVO): HISTOGRAMA COSTOS POR PRODUCTO
============================================================ */

const ctx3 = document.getElementById("histogramaChart");

new Chart(ctx3, {
    type: "bar",
    data: {
        labels: ["Pieza A", "Pieza B", "Pieza C", "Pieza D", "Pieza E"],
        datasets: [{
            label: "Costo por producto",
            data: [12000, 18500, 25000, 16000, 21000],  
            backgroundColor: "#072c3f"
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
    }
});


/* ============================================================
   SELECTORES (NO SE TOCAN)
============================================================ */

document.getElementById("chartSelect").addEventListener("change", function() {
    document.querySelectorAll(".chart-card").forEach(card => card.classList.add("hidden"));
    document.getElementById("chart-" + this.value).classList.remove("hidden");
});

document.getElementById("tableSelect").addEventListener("change", function() {
    document.querySelectorAll("table").forEach(t => t.classList.add("hidden"));
    document.getElementById("table-" + this.value).classList.remove("hidden");
});


/* ============================================================
   CARRUSEL (NO TOCAR)
============================================================ */

let insightPos = 0;
setInterval(() => {
    insightPos = (insightPos + 1) % 3;
    document.getElementById("insightsInner").style.transform =
        `translateX(-${insightPos * 100}%)`;
}, 3000);
