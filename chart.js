/* =============================
   Gráfico principal (Forecast)
============================= */
const ctx1 = document.getElementById("forecastChart");

new Chart(ctx1, {
    type: "line",
    data: {
        labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
        datasets: [{
            label: "Forecast",
            data: [5, 10, 85, 60, 45, 25, 10],
            borderColor: "#072c3f",
            borderWidth: 3,
            pointRadius: 3,
            tension: 0.35
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false }},
        scales: {
            y: { beginAtZero: true }
        },
        animations: {
            tension: { duration: 900, easing: "easeOutBounce" }
        }
    }
});

/* =============================
   Segundo gráfico (Desviaciones)
============================= */
const ctx2 = document.getElementById("desviacionChart");

new Chart(ctx2, {
    type: "bar",
    data: {
        labels: ["Mes 1", "Mes 2", "Mes 3"],
        datasets: [{
            label: "% Desviación",
            data: [18, 7, -5],
            backgroundColor: ["#f55b5b", "#ffc847", "#43c16f"]
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









