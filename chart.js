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
   GRÁFICO 3 (REEMPLAZADO): HISTOGRAMA – Costos por producto
============================================================ */

// Datos inventados pero realistas para que se vea “lleno”
const productos = [
    "Pieza Motor", "Filtro Aire", "Tapa Acceso", "Panel Lateral",
    "Cableado A", "Tornillo M5", "Bisagra X12", "Sensor Omega"
];

const costosProductos = [125000, 98000, 76000, 54000, 48000, 33000, 25000, 21000];

// Render histograma
const ctx3 = document.getElementById("tortaChart");
const chartTorta = new Chart(ctx3, {
    type: "bar",
    data: {
        labels: productos,
        datasets: [{
            label: "Costo por producto",
            data: costosProductos,
            backgroundColor: "#072c3f"  // mismo color todas las barras
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false }},
        scales: { y: { beginAtZero: true } }
    }
});


/* ============================================================
   GRÁFICO 4: Cumplimiento por proveedor
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
   PANEL DE ALERTAS, RANKING, COSTO
============================================================ */

function actualizarPaneles() {
    const alertText = document.getElementById("alertText");
    const causaText = document.getElementById("causaText");
    const recomendacionText = document.getElementById("recomendacionText");
    const rankingList = document.getElementById("rankingList");
    const costoText = document.getElementById("costoText");
    const chartSelect = document.getElementById("chartSelect");

    // Desviaciones
    const maxDesv = Math.max(...desviaciones);
    const idxMax = desviaciones.indexOf(maxDesv);
    const etiquetasDesv = ["Mes actual", "Week 2", "Week 3"];

    // Mensajes alerta
    let mensajeAlerta = "";
    if (maxDesv > 15) {
        mensajeAlerta = `⚠️ Alerta crítica: La mayor desviación positiva es de ${maxDesv.toFixed(1)}% en ${etiquetasDesv[idxMax]}.`;
    } else if (maxDesv > 8) {
        mensajeAlerta = `⚠️ Atención: Desviación de ${maxDesv.toFixed(1)}%.`;
    } else if (maxDesv > 3) {
        mensajeAlerta = `ℹ️ Desviaciones moderadas (${maxDesv.toFixed(1)}%).`;
    } else {
        mensajeAlerta = `✅ Forecast bajo control.`;
    }

    // Causa aleatoria
    const causas = [
        "Aumento inesperado de demanda por nuevos contratos.",
        "Cambio operativo en rutas.",
        "Retraso en proveedores.",
        "Forecast sin suficiente historial.",
        "Efecto estacional no considerado."
    ];
    causaText.textContent = causas[Math.floor(Math.random()*causas.length)];

    // Recomendación
    if (maxDesv > 15) recomendacion = "Ajustar forecast ≥ 12% y aumentar stock.";
    else if (maxDesv > 8) recomendacion = "Aplicar ajuste moderado (5–10%).";
    else if (maxDesv > 3) recomendacion = "Monitoreo semanal recomendado.";
    else recomendacion = "No se requieren ajustes.";

    recomendacionText.textContent = recomendacion;

    // NUEVO Ranking basado en costos del histograma
    const ranking = productos
        .map((p, i) => ({ producto: p, valor: costosProductos[i] }))
        .sort((a, b) => b.valor - a.valor);

    rankingList.innerHTML = "";
    ranking.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.producto}: $${item.valor.toLocaleString("es-CL")}`;
        rankingList.appendChild(li);
    });

    // Costo estimado
    const costoEstimado = desviaciones.reduce((acc, d) => acc + Math.abs(d) * 50000, 0);
    costoText.textContent = 
        `Costo estimado asociado a desviaciones: ${costoEstimado.toLocaleString("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0})}.`;

    // Ajuste mensaje según vista
    if (chartSelect.value === "torta") {
        alertText.textContent = "Mostrando costos por producto.";
    } else {
        alertText.textContent = mensajeAlerta;
    }
}

// Inicializa paneles
actualizarPaneles();


/* ============================================================
   CARRUSEL DE INSIGHTS
============================================================ */

const insightsCard = document.getElementById("insightsCard");
const insightsInner = document.querySelector(".insights-inner");
const slides = document.querySelectorAll(".insight-slide");

let currentSlide = 0;
let autoInterval = null;
let lastX = null;
let lastSwitchTime = 0;
const SWITCH_THRESHOLD_PX = 40;
const SWITCH_MIN_DELAY = 600;
let isHover = false;

function goToSlide(index) {
    const total = slides.length;
    currentSlide = (index + total) % total;
    insightsInner.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function startAutoSlide() {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 6000);
}

function stopAutoSlide() {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = null;
}

goToSlide(0);
startAutoSlide();

insightsCard.addEventListener("mouseenter", () => { isHover = true; stopAutoSlide(); });
insightsCard.addEventListener("mouseleave", () => { isHover = false; lastX = null; startAutoSlide(); });

insightsCard.addEventListener("mousemove", (e) => {
    if (!isHover) return;

    if (lastX === null) {
        lastX = e.clientX;
        return;
    }

    const dx = e.clientX - lastX;
    const now = Date.now();

    if (Math.abs(dx) > SWITCH_THRESHOLD_PX && (now - lastSwitchTime) > SWITCH_MIN_DELAY) {
        if (dx > 0) goToSlide(currentSlide - 1);
        else goToSlide(currentSlide + 1);
        lastSwitchTime = now;
        lastX = e.clientX;
    }
});


/* ============================================================
   SELECTOR DE GRÁFICAS
============================================================ */

document.getElementById("chartSelect").addEventListener("change", function() {
    document.getElementById("forecastCard").classList.add("hidden");
    document.getElementById("desviacionCard").classList.add("hidden");
    document.getElementById("tortaCard").classList.add("hidden");
    document.getElementById("proveedorCard").classList.add("hidden");

    if (this.value === "forecast") document.getElementById("forecastCard").classList.remove("hidden");
    if (this.value === "desviacion") document.getElementById("desviacionCard").classList.remove("hidden");
    if (this.value === "torta") document.getElementById("tortaCard").classList.remove("hidden");
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
