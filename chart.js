document.addEventListener("DOMContentLoaded", () => {

    // === Datos inventados (ejemplo) ===
    const fechas = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const demanda = [120, 150, 170, 160, 200, 180, 190];
    const forecast = [130, 145, 165, 150, 210, 175, 185];

    // === Llenar Tabla ===
    const tbody = document.querySelector("#tablaPedidos tbody");

    for (let i = 1; i <= 10; i++) {
        tbody.innerHTML += `
            <tr class="row-hover">
                <td>PED-${i}</td>
                <td>Cliente ${i}</td>
                <td>2025-12-${10 + i}</td>
                <td>${i % 2 === 0 ? "Entregado" : "En proceso"}</td>
                <td>${80 + i * 5}</td>
            </tr>`;
    }

    // === Datos estadísticos ===
    document.getElementById("totalDemanda").textContent =
        demanda.reduce((a, b) => a + b, 0);

    document.getElementById("promedioPedido").textContent =
        Math.round(demanda.reduce((a, b) => a + b, 0) / demanda.length);

    document.getElementById("pedidosActivos").textContent = 10;

    // === Gráfico ===
    const ctx = document.getElementById("forecastChart").getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: fechas,
            datasets: [
                {
                    label: "Demanda Real",
                    data: demanda,
                    borderColor: "red",
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                    tension: 0.3,
                },
                {
                    label: "Forecast",
                    data: forecast,
                    borderColor: "orange",
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                    tension: 0.3,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: "white" }
                }
            },
            interaction: {
                mode: "nearest",
                intersect: false
            },
            scales: {
                x: { ticks: { color: "white" } },
                y: { ticks: { color: "white" } }
            }
        }
    });
});






