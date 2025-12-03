/* ============================================================
   GRÁFICO PRINCIPAL (Forecast + Demanda Real)
   Puedes editar los datos directamente en los arrays de abajo.
============================================================ */

// SEMANAS (etiquetas)
const semanas = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"];

// FORECAST por semana (edita a tu gusto)
const forecastSemanal = [5, 10, 85, 60, 45, 25, 10];

// DEMANDA REAL por semana (línea recta o variable)
const realSemanal = [40, 40, 40, 40, 40, 40, 40]; 
// Ejemplo recto ↑ — cámbialo como quieras (p. ej. [42,38,41,40,43,39,44])

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
    options: {
        responsive: true,
        plugins: { 
            legend: { display: true }
        },
        scales: {
            y: { beginAtZero: true }
        }
    }
});


/* ============================================================
   GRÁFICO SECUNDARIO (Desviaciones %)
   Se calcula automáticamente con tus datos mensuales.
============================================================ */

// DATOS MENSUALES → EDITA AQUÍ TUS VALORES REALES
const esperadoMensual = [120, 90, 60];   // Forecast real por mes
const realMensual     = [80, 30, 20];    // Demanda real por mes

// CÁLCULO AUTOMÁTICO DE DESVIACIÓN %
const desviaciones = realMensual.map((r, i) => ((r - esperadoMensual[i]) / esperadoMensual[i]) * 100);

// Etiquetas de cada mes
const meses = ["Mes actual", "Week 2", "Week 3"];

const ctx2 = document.getElementById("desviacionChart");

new Chart(ctx2, {
    type: "bar",
    data: {
        labels: meses,
        datasets: [{
            label: "% Desviación",
            data: desviaciones,
            backgroundColor: ["#f55b5b", "#ffc847", "#43c16f"] 
            // Rojo, amarillo, verde — tus colores originales.
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false }},
        scales: {
            y: { beginAtZero: true }
        }
    }
});










