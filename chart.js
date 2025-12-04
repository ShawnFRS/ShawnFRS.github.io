/* ============================================================
   GRÁFICO 1: Forecast vs Real
============================================================ */

const semanas = ["W1","W2","W3","W4","W5","W6","W7"];
const forecastSemanal = [5,10,85,60,45,25,10];
const realSemanal     = [9,12,81,35,56,31,12];

const ctx1 = document.getElementById("forecastChart");
const chartForecast = new Chart(ctx1, {
    type: "line",
    data: {
        labels: semanas,
        datasets: [
            {
                label: "Forecast",
                data: forecastSemanal,
                borderColor: "#072c3f",
                borderWidth: 3,
                pointRadius: 3,
                tension: 0.35
            },
            {
                label: "Demanda Real",
                data: realSemanal,
                borderColor: "#f55b5b",
                borderWidth: 3,
                pointRadius: 0,
                borderDash: [6, 6],
                tension: 0
            },
            {
                label: "Forecast ajustado",
                data: forecastSemanal.slice(),
                borderColor: "#ffc847",
                borderWidth: 2,
                pointRadius: 0,
                borderDash: [4, 4],
                tension: 0.35
            }
        ]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: true }},
        scales: { y: { beginAtZero: true } }
    }
});


/* ============================================================
   GRÁFICO 2: Desviación %
============================================================ */

const esperadoMensual = [120, 90, 60];
const realMensual     = [80, 30, 20];
const desviaciones = realMensual.map((r,i)=>((r-esperadoMensual[i])/esperadoMensual[i])*100);

const ctx2 = document.getElementById("desviacionChart");
const chartDesviacion = new Chart(ctx2, {
    type: "bar",
    data: {
        labels: ["Mes actual", "Week 2", "Week 3"],
        datasets: [{
            label: "% Desviación",
            data: desviaciones,
            backgroundColor: ["#f55b5b", "#ffc847", "#43c16f"]
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false }},
        scales: { y: { beginAtZero: true } }
    }
});


/* ============================================================
   GRÁFICO 3 (nuevo): Costos por pieza
============================================================ */

const piezas = [
    "Filtros", "Pastillas freno", "Discos/Tambores",
    "Neumáticos", "Batería", "Alternador",
    "Motor arranque", "Correas", "Amortiguadores",
    "Bolsas aire", "Mangueras", "Compresor aire",
    "Bomba combustible", "Inyectores", "Puertas automáticas"
];

const costoPiezas = [
    18000, 35000, 52000, 90000, 70000,
    120000, 95000, 40000, 85000, 115000,
    38000, 140000, 75000, 68000, 160000
];

const ctxCosto = document.getElementById("costoChart");
const chartCosto = new Chart(ctxCosto, {
    type: "bar",
    data: {
        labels: piezas,
        datasets: [{
            data: costoPiezas,
            backgroundColor: "#072c3f"
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false }},
        scales: { y: { beginAtZero: true } }
    }
});


/* ============================================================
   GRÁFICO 4: Barras – Cumplimiento por proveedor
============================================================ */

const proveedores = ["Proveedor X", "Proveedor Y", "Proveedor Z"];
const cumplimiento = [92, 85, 60];

const ctx4 = document.getElementById("proveedorChart");
const chartProveedor = new Chart(ctx4, {
    type: "bar",
    data: {
        labels: proveedores,
        datasets: [{
            label: "% Cumplimiento",
            data: cumplimiento,
            backgroundColor: ["#43c16f", "#ffc847", "#f55b5b"]
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false }},
        scales: { y: { beginAtZero: true } }
    }
});


/* ============================================================
   SIMULADOR
============================================================ */

const slider = document.getElementById("ajusteSlider");
const ajusteValor = document.getElementById("ajusteValor");

slider.addEventListener("input", function() {
    const ajuste = parseInt(this.value);
    const factor = 1 + ajuste / 100;
    ajusteValor.textContent = (ajuste > 0 ? "+" + ajuste : ajuste) + "%";
    
    const ajustado = forecastSemanal.map(v => Math.round(v * factor));
    chartForecast.data.datasets[2].data = ajustado;
    chartForecast.update();
});


/* ============================================================
   SELECTOR DE GRÁFICOS (CORREGIDO)
============================================================ */

document.getElementById("chartSelect").addEventListener("change", function() {

    document.getElementById("forecastCard").classList.add("hidden");
    document.getElementById("desviacionCard").classList.add("hidden");
    document.getElementById("costoCard").classList.add("hidden");
    document.getElementById("proveedorCard").classList.add("hidden");

    if (this.value === "forecast") document.getElementById("forecastCard").classList.remove("hidden");
    if (this.value === "desviacion") document.getElementById("desviacionCard").classList.remove("hidden");
    if (this.value === "costo") document.getElementById("costoCard").classList.remove("hidden");
    if (this.value === "proveedor") document.getElementById("proveedorCard").classList.remove("hidden");

    actualizarPaneles();
});


/* ============================================================
   SELECTOR DE TABLAS
============================================================ */

document.getElementById("tableSelect").addEventListener("change", function () {

    document.getElementById("tablaComparacion").classList.add("hidden");
    document.getElementById("tablaProveedores").classList.add("hidden");
    document.getElementById("tablaInventario").classList.add("hidden");

    if (this.value === "tablaComparacion") document.getElementById("tablaComparacion").classList.remove("hidden");
    if (this.value === "tablaProveedores") document.getElementById("tablaProveedores").classList.remove("hidden");
    if (this.value === "tablaInventario") document.getElementById("tablaInventario").classList.remove("hidden");
});


/* ============================================================
   CARRUSEL (SIN CAMBIOS)
============================================================ */

