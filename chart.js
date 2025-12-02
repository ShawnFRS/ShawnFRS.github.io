// =========================
// CONFIGURACIÓN GOOGLE SHEETS
// =========================

// ID del documento (lo saqué de tu URL)
const SHEET_ID = "1p6COx4r71vX7hyl8xHGjSV8ah2QmkDjIwcvCzBITpYA";

// gid de la hoja específica (también de tu URL)
const GID = "1467972506";

// Endpoint público de Google Visualization API (formato JSON raro)
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&tqx=out:json`;

// =========================
// FUNCIÓN PRINCIPAL
// =========================

async function loadDataFromSheet() {
    try {
        const res = await fetch(SHEET_URL);
        const text = await res.text();

        // La respuesta viene como: "/*O_o*/\ngoogle.visualization.Query.setResponse({...});"
        const json = JSON.parse(text.substring(47, text.length - 2));
        const rows = json.table.rows;

        const weeks = [];
        const expected = [];
        const committed = [];
        const inStock = [];
        const suggested = [];
        const realDemand = [];

        rows.forEach(row => {
            const c = row.c;

            // Cada c[i] puede ser null si la celda está vacía
            weeks.push(c[0]?.v ?? "");
            expected.push(Number(c[1]?.v ?? 0));
            committed.push(Number(c[2]?.v ?? 0));
            inStock.push(Number(c[3]?.v ?? 0));
            suggested.push(Number(c[4]?.v ?? 0));
            realDemand.push(Number(c[5]?.v ?? 0));
        });

        // =========================
        // 1. ACTUALIZAR TABLA HTML
        // =========================
        const tbody = document.getElementById("table-body");
        tbody.innerHTML = "";

        for (let i = 0; i < weeks.length; i++) {
            const tr = document.createElement("tr");

            const tdWeek = document.createElement("td");
            tdWeek.textContent = weeks[i];

            const tdExpected = document.createElement("td");
            tdExpected.textContent = expected[i];

            const tdCommitted = document.createElement("td");
            tdCommitted.textContent = committed[i];

            const tdInStock = document.createElement("td");
            const stockBadge = document.createElement("span");
            stockBadge.classList.add("badge");

            // Colores según nivel de stock
            if (inStock[i] <= 0) {
                stockBadge.classList.add("red");
            } else if (inStock[i] < 30) {
                stockBadge.classList.add("yellow");
            } else {
                stockBadge.classList.add("green");
            }
            stockBadge.textContent = inStock[i];
            tdInStock.appendChild(stockBadge);

            const tdSuggested = document.createElement("td");
            tdSuggested.textContent = suggested[i];

            tr.appendChild(tdWeek);
            tr.appendChild(tdExpected);
            tr.appendChild(tdCommitted);
            tr.appendChild(tdInStock);
            tr.appendChild(tdSuggested);

            tbody.appendChild(tr);
        }

        // =========================
        // 2. CREAR / ACTUALIZAR GRÁFICO
        // =========================
        const ctx = document.getElementById("forecastChart");

        new Chart(ctx, {
            type: "line",
            data: {
                labels: weeks,
                datasets: [
                    {
                        label: "Forecast (Expected)",
                        data: expected,
                        borderWidth: 3,
                        tension: 0.3
                    },
                    {
                        label: "Real demand",
                        data: realDemand,
                        borderWidth: 3,
                        borderDash: [6, 4],
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom"
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (err) {
        console.error("Error cargando datos desde Google Sheets:", err);
    }
}

// Ejecutar cuando carga la página
loadDataFromSheet();

