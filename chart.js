/* ============================================================
   GRÁFICO 1: Forecast vs Real
============================================================ */

const semanas = ["W1","W2","W3","W4","W5","W6","W7"];
const forecastSemanal = [5,10,85,60,45,25,10];
const realSemanal     = [40,40,40,40,40,40,40];

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
            }
        ]
    },
    options: { responsive: true }
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
    options: { responsive: true }
});


/* ============================================================
   GRÁFICO 3: TORTA – Productos con mayor error
============================================================ */

const ctx3 = document.getElementById("tortaChart");
const chartTorta = new Chart(ctx3, {
    type: "pie",
    data: {
        labels: ["Producto A", "Producto B", "Producto C", "Producto D"],
        datasets: [{
            data: [40, 30, 20, 10],
            backgroundColor: ["#072c3f", "#f55b5b", "#ffc847", "#43c16f"]
        }]
    },
    options: { responsive: true }
});


/* ============================================================
   GRÁFICO 4: Barras – Cumplimiento por proveedor
============================================================ */

const ctx4 = document.getElementById("proveedorChart");
const chartProveedor = new Chart(ctx4, {
    type: "bar",
    data: {
        labels: ["Proveedor X", "Proveedor Y", "Proveedor Z"],
        datasets: [{
            label: "% Cumplimiento",
            data: [92, 85, 60],
            backgroundColor: ["#43c16f", "#ffc847", "#f55b5b"]
        }]
    },
    options: { responsive: true }
});


/* ============================================================
   LÓGICA DEL MENÚ (mostrar/ocultar gráficas)
============================================================ */

document.getElementById("chartSelect").addEventListener("change", function() {

    // Oculta todos
    document.getElementById("forecastCard").classList.add("hidden");
    document.getElementById("desviacionCard").classList.add("hidden");
    document.getElementById("tortaCard").classList.add("hidden");
    document.getElementById("proveedorCard").classList.add("hidden");

    // Muestra el seleccionado
    if (this.value === "forecast") {
        document.getElementById("forecastCard").classList.remove("hidden");
    }
    if (this.value === "desviacion") {
        document.getElementById("desviacionCard").classList.remove("hidden");
    }
    if (this.value === "torta") {
        document.getElementById("tortaCard").classList.remove("hidden");
    }
    if (this.value === "proveedor") {
        document.getElementById("proveedorCard").classList.remove("hidden");
    }
});
