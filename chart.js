/* ============================================================
   GRÁFICO 1: Forecast vs Real
============================================================ */

const semanas = ["W1","W2","W3","W4","W5","W6","W7"];
const forecastSemanal = [5,10,85,60,45,25,10];
const realSemanal     = [9,12,81,35,56,31,12];

const ctx1 = document.getElementById("forecastChart");
new Chart(ctx1, {
    type: "line",
    data: {
        labels: semanas,
        datasets: [
            {
                label: "Forecast",
                data: forecastSemanal,
                borderColor: "#072c3f",
                borderWidth: 3,
                pointRadius: 3
            },
            {
                label: "Real",
                data: realSemanal,
                borderColor: "#f55b5b",
                borderWidth: 3,
                pointRadius: 3
            }
        ]
    }
});

/* ============================================================
   GRÁFICO 2: Desviación
============================================================ */

const esperadoMensual = [120, 90, 60];
const realMensual     = [80, 30, 20];
const desviaciones = realMensual.map((r,i)=>((r-esperadoMensual[i])/esperadoMensual[i])*100);

const ctx2 = document.getElementById("desviacionChart");
new Chart(ctx2, {
    type: "bar",
    data: {
        labels: ["Mes actual", "Week 2", "Week 3"],
        datasets: [{
            label: "Desviación %",
            data: desviaciones,
            backgroundColor: ["#f55b5b", "#ffc847", "#43c16f"]
        }]
    }
});

/* ============================================================
   GRÁFICO 3: Proveedor
============================================================ */

const proveedores = ["Proveedor X", "Proveedor Y", "Proveedor Z"];
const cumplimiento = [92, 85, 60];

const ctx4 = document.getElementById("proveedorChart");
new Chart(ctx4, {
    type: "bar",
    data: {
        labels: proveedores,
        datasets: [{
            data: cumplimiento,
            backgroundColor: ["#43c16f", "#ffc847", "#f55b5b"]
        }]
    }
});

/* ============================================================
   GRÁFICO 4: Costos por pieza (NUEVO)
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
new Chart(ctxCosto, {
    type: "bar",
    data: {
        labels: piezas,
        datasets: [{
            data: costoPiezas,
            backgroundColor: "#072c3f"
        }]
    }
});

/* ============================================================
   SELECTOR DE GRÁFICOS (CORREGIDO)
============================================================ */

document.getElementById("chartSelect").addEventListener("change", function() {

    document.getElementById("forecastCard").classList.add("hidden");
    document.getElementById("desviacionCard").classList.add("hidden");
    document.getElementById("proveedorCard").classList.add("hidden");
    document.getElementById("costoCard").classList.add("hidden");

    if (this.value === "forecast") document.getElementById("forecastCard").classList.remove("hidden");
    if (this.value === "desviacion") document.getElementById("desviacionCard").classList.remove("hidden");
    if (this.value === "proveedor") document.getElementById("proveedorCard").classList.remove("hidden");
    if (this.value === "costo") document.getElementById("costoCard").classList.remove("hidden");
});

/* ============================================================
   SELECTOR DE TABLAS
============================================================ */

document.getElementById("tablaSelect").addEventListener("change", function() {

    document.getElementById("tablaForecast").classList.add("hidden");
    document.getElementById("tablaProveedor").classList.add("hidden");
    document.getElementById("tablaInventario").classList.add("hidden");

    if (this.value === "tablaForecast") document.getElementById("tablaForecast").classList.remove("hidden");
    if (this.value === "tablaProveedor") document.getElementById("tablaProveedor").classList.remove("hidden");
    if (this.value === "tablaInventario") document.getElementById("tablaInventario").classList.remove("hidden");
});
