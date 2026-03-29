/* ============================================================
   GRÁFICO 1: Forecast vs Real
============================================================ */

const semanas = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"];
const forecastSemanal = [5,10,85,60,45,25,10,12,8,9,13,11];
const realSemanal     = [9,12,81,35,56,31,12,13,10,13,10,9];

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
                backgroundColor: "rgba(7, 44, 63, 0.1)",
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.35,
                fill: true
            },
            {
                label: "Demanda Real",
                data: realSemanal,
                borderColor: "#f55b5b",
                backgroundColor: "rgba(245, 91, 91, 0.1)",
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderDash: [6, 6],
                tension: 0,
                fill: true
            },
            {
                label: "Forecast ajustado",
                data: forecastSemanal.slice(),
                borderColor: "#ffc847",
                backgroundColor: "rgba(255, 200, 71, 0.1)",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                borderDash: [4, 4],
                tension: 0.35,
                fill: true
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { 
            legend: { 
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        weight: 500
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: { 
            y: { 
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
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
            backgroundColor: [
                "rgba(245, 91, 91, 0.8)",
                "rgba(255, 200, 71, 0.8)",
                "rgba(67, 193, 111, 0.8)"
            ],
            borderColor: [
                "#f55b5b",
                "#ffc847",
                "#43c16f"
            ],
            borderWidth: 2,
            borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        return 'Desviación: ' + context.parsed.y.toFixed(1) + '%';
                    }
                }
            }
        },
        scales: { 
            y: { 
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});


/* ============================================================
   GRÁFICO 3: HISTOGRAMA – Costos por producto
============================================================ */

const productosConCosto = [
    "Motor completo Sprinter", 
    "Motor de arranque", 
    "Parabrisas", 
    "Caja de cambios", 
    "Caja dirección",
    "Calibre de freno",
    "Discos de freno",
    "Amortiguadores",
    "Batería",
    "Compresor aire acondicionado",
    "Paquete de resoster",
    "Pastillas de freno",
    "Kit de filtros"
];
const costosPorProducto = [
    13000000,  // Motor completo Sprinter
    1600000,   // Motor de arranque (Caja diferencial)
    780000,    // Parabrisas
    600000,    // Caja de cambios
    650000,    // Caja dirección
    440000,    // Calibre de freno
    350000,    // Discos de freno
    250000,    // Amortiguadores
    150000,    // Batería
    1100000,   // Compresor aire acondicionado
    1100000,   // Paquete de resoster
    100000,    // Pastillas de freno
    89000      // Kit de filtros
];

const ctx3 = document.getElementById("costosChart");
const chartCostos = new Chart(ctx3, {
    type: "bar",
    data: {
        labels: productosConCosto,
        datasets: [{
            label: "Costo (CLP)",
            data: costosPorProducto,
            backgroundColor: [
                "rgba(7, 44, 63, 0.8)",
                "rgba(245, 91, 91, 0.8)",
                "rgba(255, 200, 71, 0.8)",
                "rgba(67, 193, 111, 0.8)",
                "rgba(107, 163, 209, 0.8)",
                "rgba(155, 89, 182, 0.8)",
                "rgba(230, 126, 34, 0.8)",
                "rgba(26, 188, 156, 0.8)",
                "rgba(52, 73, 94, 0.8)",
                "rgba(231, 76, 60, 0.8)",
                "rgba(142, 68, 173, 0.8)",
                "rgba(241, 196, 15, 0.8)",
                "rgba(46, 204, 113, 0.8)"
            ],
            borderColor: [
                "#072c3f", "#f55b5b", "#ffc847", "#43c16f", "#6ba3d1",
                "#9b59b6", "#e67e22", "#1abc9c", "#34495e", "#e74c3c",
                "#8e44ad", "#f1c40f", "#2ecc71"
            ],
            borderWidth: 2,
            borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        return context.parsed.y.toLocaleString("es-CL", {
                            style: "currency",
                            currency: "CLP",
                            maximumFractionDigits: 0
                        });
                    }
                }
            }
        },
        scales: { 
            y: { 
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    callback: function(value) {
                        return '$' + (value / 1000000).toFixed(1) + 'M';
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        }
    }
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
            backgroundColor: [
                "rgba(67, 193, 111, 0.8)",
                "rgba(255, 200, 71, 0.8)",
                "rgba(245, 91, 91, 0.8)"
            ],
            borderColor: [
                "#43c16f",
                "#ffc847",
                "#f55b5b"
            ],
            borderWidth: 2,
            borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        return 'Cumplimiento: ' + context.parsed.y + '%';
                    }
                }
            }
        },
        scales: { 
            y: { 
                beginAtZero: true,
                max: 100,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
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
   ACTUALIZAR KPIs
============================================================ */

function actualizarKPIs() {
    // Desviación promedio
    const desviacionPromedio = desviaciones.reduce((a, b) => a + b, 0) / desviaciones.length;
    document.getElementById("kpiDesviacion").textContent = desviacionPromedio.toFixed(1) + "%";
    
    // Costo total productos
    const costoTotal = costosPorProducto.reduce((a, b) => a + b, 0);
    document.getElementById("kpiCostoTotal").textContent = "$" + (costoTotal / 1000000).toFixed(1) + "M";
    
    // Cumplimiento proveedores promedio
    const cumplimientoPromedio = cumplimiento.reduce((a, b) => a + b, 0) / cumplimiento.length;
    document.getElementById("kpiCumplimiento").textContent = Math.round(cumplimientoPromedio) + "%";
    
    // Items críticos (contar badges rojos en la tabla de inventario)
    document.getElementById("kpiCriticos").textContent = "4";
}

actualizarKPIs();


/* ============================================================
   PANEL DE ALERTAS, CAUSA, RECOMENDACIÓN, RANKING Y COSTO
============================================================ */

function actualizarPaneles() {
    const alertText = document.getElementById("alertText");
    const proveedorAlertText = document.getElementById("proveedorAlertText");
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

    // ALERTA FORECAST
    let mensajeAlerta = "";
    if (maxDesv > 15) {
        mensajeAlerta = `⚠️ Alerta crítica: La mayor desviación positiva es de ${maxDesv.toFixed(1)}% en ${etiquetasDesv[idxMax]}. El forecast está quedando corto frente a la demanda real. Esta situación requiere acción inmediata para evitar desabastecimiento y pérdida de operatividad en las rutas más críticas.`;
    } else if (maxDesv > 8) {
        mensajeAlerta = `⚠️ Atención: Se observa una desviación de ${maxDesv.toFixed(1)}% en ${etiquetasDesv[idxMax]}. Es recomendable revisar el forecast del trimestre y ajustar los parámetros de predicción basándose en los datos históricos más recientes.`;
    } else if (maxDesv > 3) {
        mensajeAlerta = `ℹ️ Desviaciones moderadas: la mayor es de ${maxDesv.toFixed(1)}%. Se sugiere seguir monitoreando y documentar cualquier patrón que pueda indicar una tendencia emergente en la demanda.`;
    } else {
        mensajeAlerta = `✅ Forecast bajo control: las desviaciones actuales son menores al 3%. El modelo de predicción está funcionando correctamente y se mantiene alineado con la demanda real del negocio.`;
    }

    // ALERTA DE PROVEEDORES
    const proveedoresConProblemas = [
        {
            nombre: "Repuestos del Sur Ltda.",
            piezas: ["Compresor aire acondicionado", "Paquete de resoster", "Calibre de freno"],
            problema: "sin stock",
            impacto: "alto",
            dias: 7
        },
        {
            nombre: "TransDiesel Chile",
            piezas: ["Motor completo Sprinter", "Caja de cambios"],
            problema: "retraso en entrega",
            impacto: "crítico",
            dias: 4
        },
        {
            nombre: "MaqParts S.A.",
            piezas: ["Discos de freno", "Pastillas de freno"],
            problema: "stock limitado",
            impacto: "medio",
            dias: 2
        }
    ];

    const proveedorCritico = proveedoresConProblemas[0];
    const piezasAfectadas = proveedorCritico.piezas.join(", ");
    
    let mensajeProveedor = `🚨 ALERTA CRÍTICA: El proveedor ${proveedorCritico.nombre} reporta estar ${proveedorCritico.problema} de piezas críticas incluyendo: ${piezasAfectadas}.\n\n`;
    mensajeProveedor += `⏰ Tiempo estimado de reabastecimiento: ${proveedorCritico.dias} días hábiles.\n\n`;
    mensajeProveedor += `📊 Impacto evaluado: ${proveedorCritico.impacto.toUpperCase()}. Esta situación puede afectar seriamente la operación de la flota si no se toman medidas inmediatas.\n\n`;
    mensajeProveedor += `💡 Acción recomendada:\n`;
    mensajeProveedor += `• Contactar proveedores alternativos inmediatamente\n`;
    mensajeProveedor += `• Revisar stock disponible en bodega central\n`;
    mensajeProveedor += `• Priorizar mantenimientos preventivos sobre correctivos\n`;
    mensajeProveedor += `• Evaluar compra de emergencia con otro distribuidor\n\n`;
    mensajeProveedor += `📞 Otros proveedores con alertas activas:\n`;
    proveedoresConProblemas.slice(1).forEach(p => {
        mensajeProveedor += `• ${p.nombre}: ${p.problema} (${p.piezas.length} piezas afectadas)\n`;
    });

    // Causa probable
    const causas = [
        "Aumento inesperado de demanda por nuevos contratos de servicio con empresas o instituciones educacionales, lo que ha incrementado significativamente el uso de repuestos críticos.",
        "Cambio en la operación debido a la incorporación de nuevas rutas o aumento de frecuencias en horarios peak, generando mayor desgaste de componentes mecánicos.",
        "Retraso en reposición de inventario por parte de un proveedor clave, causado por problemas logísticos o escasez de materias primas en el mercado internacional.",
        "Error de estimación en el forecast original por falta de historial suficiente o uso de datos no representativos del comportamiento estacional de la demanda.",
        "Efecto estacional no considerado en el modelo de forecast, particularmente relacionado con períodos de mayor uso vehicular como inicio de clases o temporada turística."
    ];
    const causaSeleccionada = causas[Math.floor(Math.random() * causas.length)];

    // Recomendación automática
    let recomendacion = "";
    if (maxDesv > 15) {
        recomendacion = "Se recomienda recalcular urgentemente el forecast del trimestre con un ajuste ≥ 12%. Además, es crítico aumentar el stock de seguridad en un 20-30% para los productos más demandados, revisar y renegociar los contratos con proveedores para garantizar entregas más frecuentes, y establecer un sistema de alertas tempranas para monitoreo diario de inventario crítico.";
    } else if (maxDesv > 8) {
        recomendacion = "Aplicar un ajuste moderado al forecast (entre 5% y 10%) basándose en el análisis de los últimos tres meses de demanda real. Monitorear semanalmente la demanda real versus forecast para confirmar si la tendencia se mantiene, y considerar la implementación de un modelo de predicción más robusto que incorpore variables estacionales y eventos especiales.";
    } else if (maxDesv > 3) {
        recomendacion = "Mantener el forecast actual pero activar alertas tempranas si la desviación supera el 10% en los próximos meses. Documentar los factores que están contribuyendo a estas desviaciones moderadas y realizar un análisis mensual de causas raíz para mejorar continuamente la precisión del modelo predictivo.";
    } else {
        recomendacion = "No se requieren ajustes al forecast por ahora. Continuar con el monitoreo regular semanal y documentar meticulosamente los factores que están manteniendo la estabilidad del sistema. Compartir las mejores prácticas con el equipo y considerar este modelo como referencia para otras áreas operativas del negocio.";
    }

    // Ranking de productos por costo
    const ranking = productosConCosto
        .map((p, i) => ({ producto: p, costo: costosPorProducto[i] }))
        .sort((a, b) => b.costo - a.costo);

    rankingList.innerHTML = "";
    ranking.forEach((item, index) => {
        const li = document.createElement("li");
        const costoFormateado = item.costo.toLocaleString("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        });
        const emoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "▪️";
        li.textContent = `${emoji} ${item.producto}: ${costoFormateado}`;
        rankingList.appendChild(li);
    });

    // Costo estimado
    const costoEstimado = desviaciones
        .reduce((acc, d) => acc + Math.abs(d) * 50000, 0);

    const costoFormato = costoEstimado.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });

    costoText.textContent = `💸 Costo estimado asociado a las desviaciones actuales: ${costoFormato}. Este monto representa el impacto financiero de tener inventario por encima o por debajo de lo óptimo.`;

    // Ajustar mensajes según gráfico seleccionado
    const seleccionado = chartSelect.value;
    if (seleccionado === "forecast") {
        alertText.textContent = mensajeAlerta + " (Vista: Forecast vs Real)";
    } else if (seleccionado === "desviacion") {
        alertText.textContent = mensajeAlerta + " (Vista: Desviaciones por período)";
    } else if (seleccionado === "costos") {
        alertText.textContent = "📊 Analizando el impacto de costos por producto en el presupuesto total de mantenimiento. El análisis muestra la distribución de inversión en repuestos críticos. Revisa el ranking para identificar los ítems más costosos y evaluar oportunidades de optimización o negociación con proveedores.";
    } else if (seleccionado === "proveedor") {
        alertText.textContent = "🤝 Evaluando el impacto del cumplimiento de proveedores en la estabilidad del forecast y continuidad operativa. Un bajo cumplimiento puede generar quiebres de stock y afectar la disponibilidad de buses en servicio, lo que impacta directamente en los ingresos y la calidad del servicio.";
    }

    causaText.textContent = causaSeleccionada;
    proveedorAlertText.textContent = mensajeProveedor;
    recomendacionText.textContent = recomendacion;
    
    // Verificar altura del contenido y mostrar botones
    verificarAlturaMensajes();
}

actualizarPaneles();


/* ============================================================
   VERIFICAR ALTURA Y MOSTRAR BOTÓN "MOSTRAR MÁS"
============================================================ */

function verificarAlturaMensajes() {
    const contents = [
        { id: 'alertContent', btnId: 'alertShowMore' },
        { id: 'proveedorAlertContent', btnId: 'proveedorAlertShowMore' },
        { id: 'causaContent', btnId: 'causaShowMore' },
        { id: 'recomendacionContent', btnId: 'recomendacionShowMore' },
        { id: 'rankingContent', btnId: 'rankingShowMore' }
    ];
    
    contents.forEach(item => {
        const content = document.getElementById(item.id);
        const btn = document.getElementById(item.btnId);
        
        if (content && btn) {
            // Verificar si el contenido es más alto que 120px
            if (content.scrollHeight > 120) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }
    });
}

// Event listeners para botones "Mostrar más"
['alert', 'proveedorAlert', 'causa', 'recomendacion', 'ranking'].forEach(prefix => {
    const btn = document.getElementById(prefix + 'ShowMore');
    const content = document.getElementById(prefix + 'Content');
    
    if (btn && content) {
        btn.addEventListener('click', function() {
            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                content.classList.add('expanded');
                this.textContent = 'Mostrar menos ▲';
            } else {
                content.classList.add('collapsed');
                content.classList.remove('expanded');
                this.textContent = 'Mostrar más ▼';
            }
        });
    }
});


/* ============================================================
   CARRUSEL DE INSIGHTS: AUTO-SLIDE + CONTROLES
============================================================ */

const insightsCard = document.getElementById("insightsCard");
const insightsInner = document.querySelector(".insights-inner");
const slides = document.querySelectorAll(".insight-slide");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dotsContainer = document.getElementById("carouselDots");

let currentSlide = 0;
let autoInterval = null;
let isHover = false;

// Crear dots
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.carousel-dot');

function goToSlide(index) {
    const total = slides.length;
    currentSlide = (index + total) % total;
    insightsInner.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Actualizar dots
    dots.forEach((dot, i) => {
        if (i === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function startAutoSlide() {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 3500);
}

function stopAutoSlide() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
}

// Iniciar carrusel
goToSlide(0);
startAutoSlide();

// Botones de navegación
prevBtn.addEventListener('click', () => {
    goToSlide(currentSlide - 1);
    stopAutoSlide();
    setTimeout(startAutoSlide, 3000);
});

nextBtn.addEventListener('click', () => {
    goToSlide(currentSlide + 1);
    stopAutoSlide();
    setTimeout(startAutoSlide, 3000);
});

// Pausar en hover
insightsCard.addEventListener("mouseenter", () => {
    isHover = true;
    stopAutoSlide();
});

insightsCard.addEventListener("mouseleave", () => {
    isHover = false;
    startAutoSlide();
});


/* ============================================================
   LÓGICA DEL MENÚ (mostrar/ocultar gráficas + actualizar paneles)
============================================================ */

document.getElementById("chartSelect").addEventListener("change", function() {
    // Oculta todos
    document.getElementById("forecastCard").classList.add("hidden");
    document.getElementById("desviacionCard").classList.add("hidden");
    document.getElementById("costosCard").classList.add("hidden");
    document.getElementById("proveedorCard").classList.add("hidden");

    // Muestra el seleccionado
    if (this.value === "forecast") {
        document.getElementById("forecastCard").classList.remove("hidden");
    }
    if (this.value === "desviacion") {
        document.getElementById("desviacionCard").classList.remove("hidden");
    }
    if (this.value === "costos") {
        document.getElementById("costosCard").classList.remove("hidden");
    }
    if (this.value === "proveedor") {
        document.getElementById("proveedorCard").classList.remove("hidden");
    }

    // Actualiza paneles textual según la vista
    actualizarPaneles();
});


/* ============================================================
   SELECTOR DE TABLAS (debajo del gráfico)
============================================================ */

document.getElementById("tableSelect").addEventListener("change", function () {
    document.getElementById("tablaComparacion").classList.add("hidden");
    document.getElementById("tablaProveedores").classList.add("hidden");
    document.getElementById("tablaInventario").classList.add("hidden");

    if (this.value === "tablaComparacion") {
        document.getElementById("tablaComparacion").classList.remove("hidden");
    }
    if (this.value === "tablaProveedores") {
        document.getElementById("tablaProveedores").classList.remove("hidden");
    }
    if (this.value === "tablaInventario") {
        document.getElementById("tablaInventario").classList.remove("hidden");
    }
});
