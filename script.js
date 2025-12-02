const ctx = document.getElementById('forecastChart');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["W1","W2","W3","W4","W5","W6"],
        datasets: [{
            label: 'Forecast',
            data: [20, 100, 80, 60, 40, 20],
            borderWidth: 3,
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
