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
            },
            {
                label: "Forecast ajustado",
                data: forecastSemanal.slice(), // copia
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
   GRÁFICO 3: TORTA – Productos con mayor error
============================================================ */

const productos = ["Producto A", "Producto B", "Producto C", "Producto D"];
const errorProductos = [40, 30, 20, 10];

const ctx3 = document.getElementById("tortaChart");
const chartTorta = new Chart(ctx3, {
    type: "pie",
    data: {
        labels: productos,
        datasets: [{
            data: errorProductos,
            backgroundColor: ["#072c3f", "#f55b5b", "#ffc847", "#43c16f"]
        }]
    },
    options: { responsive: true }
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
   SIMULADOR DE AJUSTE FORECAST
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
   PANEL DE ALERTAS, CAUSA, RECOMENDACIÓN, RANKING Y COSTO
============================================================ */

function actualizarPaneles() {
    const alertText = document.getElementById("alertText");
    const causaText = document.getElementById("causaText");
    const recomendacionText = document.getElementById("recomendacionText");
    const rankingList = document.getElementById("rankingList");
    const costoText = document.getElementById("costoText");
    const chartSelect = document.getElementById("chartSelect");

    // Métricas base
    const maxDesv = Math.max(...desviaciones);
    const minDesv = Math.min(...desviaciones);
    const idxMax = desviaciones.indexOf(maxDesv);
    const etiquetasDesv = ["Mes actual", "Week 2", "Week 3"];

    // ALERTA
    let mensajeAlerta = "";
    if (maxDesv > 15) {
        mensajeAlerta = `⚠️ Alerta crítica: La mayor desviación positiva es de ${maxDesv.toFixed(1)}% en ${etiquetasDesv[idxMax]}. El forecast está quedando corto frente a la demanda real.`;
    } else if (maxDesv > 8) {
        mensajeAlerta = `⚠️ Atención: Se observa una desviación de ${maxDesv.toFixed(1)}% en ${etiquetasDesv[idxMax]}. Es recomendable revisar el forecast del trimestre.`;
    } else if (maxDesv > 3) {
        mensajeAlerta = `ℹ️ Desviaciones moderadas: la mayor es de ${maxDesv.toFixed(1)}%. Se sugiere seguir monitoreando.`;
    } else {
        mensajeAlerta = `✅ Forecast bajo control: las desviaciones actuales son menores al 3%.`;
    }

    // Causa probable (ligeramente aleatoria)
    const causas = [
        "Aumento inesperado de demanda por nuevos contratos de servicio.",
        "Cambio en la operación (más frecuencias o nuevas rutas).",
        "Retraso en reposición de inventario por parte de un proveedor clave.",
        "Error de estimación en el forecast original por falta de historial.",
        "Efecto estacional no considerado en el modelo de forecast."
    ];
    const causaSeleccionada = causas[Math.floor(Math.random() * causas.length)];

    // Recomendación automática (en base a la desviación)
    let recomendacion = "";
    if (maxDesv > 15) {
        recomendacion = "Recalcular el forecast del trimestre con un ajuste ≥ 12%, aumentar stock de seguridad y revisar contratos con proveedores para soportar el nuevo nivel de demanda.";
    } else if (maxDesv > 8) {
        recomendacion = "Aplicar un ajuste moderado al forecast (entre 5% y 10%) y monitorear semanalmente la demanda real para confirmar la tendencia.";
    } else if (maxDesv > 3) {
        recomendacion = "Mantener el forecast actual pero activar alertas tempranas si la desviación supera el 10% en los próximos meses.";
    } else {
        recomendacion = "No se requieren ajustes al forecast por ahora. Continuar monitoreo regular y documentar los factores que están manteniendo la estabilidad.";
    }

    // Ranking de productos por error (usando el gráfico de torta)
    const ranking = productos
        .map((p, i) => ({ producto: p, error: errorProductos[i] }))
        .sort((a, b) => b.error - a.error);

    rankingList.innerHTML = "";
    ranking.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.producto}: ${item.error}% del error total de forecast`;
        rankingList.appendChild(li);
    });

    // Costo estimado (muy simple: desviación absoluta * factor)
    const costoEstimado = desviaciones
        .reduce((acc, d) => acc + Math.abs(d) * 50000, 0); // factor inventado

    const costoFormato = costoEstimado.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });

    costoText.textContent = `Costo estimado asociado a las desviaciones actuales: ${costoFormato}.`;

    // Ajustar mensajes según gráfico seleccionado (solo texto contextual)
    const seleccionado = chartSelect.value;
    if (seleccionado === "forecast") {
        alertText.textContent = mensajeAlerta + " (Vista: Forecast vs Real)";
    } else if (seleccionado === "desviacion") {
        alertText.textContent = mensajeAlerta + " (Vista: Desviaciones por período)";
    } else if (seleccionado === "torta") {
        alertText.textContent = "Analizando la concentración del error por producto. Revisa el ranking para identificar qué ítems rompen más el forecast.";
    } else if (seleccionado === "proveedor") {
        alertText.textContent = "Evaluando el impacto del cumplimiento de proveedores en la estabilidad del forecast.";
    }

    causaText.textContent = causaSeleccionada;
    recomendacionText.textContent = recomendacion;
}

// Llamar una vez al inicio
actualizarPaneles();


/* ============================================================
   LÓGICA DEL MENÚ (mostrar/ocultar gráficas + actualizar paneles)
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

    // Actualiza paneles de texto según la vista
    actualizarPaneles();
});
