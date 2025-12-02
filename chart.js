const ctx = document.getElementById("forecastChart");

new Chart(ctx, {
    type: "line",
    data: {
        labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
        datasets: [{
            label: "Forecast",
            data: [5, 10, 85, 60, 45, 25, 10],
            borderColor: "#072c3f",
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.3
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
