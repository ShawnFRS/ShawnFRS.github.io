/* ============================================================
   TRIAJENET — script.js
   Lógica de: (1) clasificación de pre-triage tipo Manchester
              (2) listado/orden de centros asistenciales
              (3) simulación de cola en vivo con localStorage
   ============================================================ */

(() => {
  "use strict";

  const STORAGE_KEY = "triajenet_estado_v1";

  /* ----------------------------------------------------------
     0. ESTADO PERSISTENTE
     ---------------------------------------------------------- */
  function cargarEstado() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function guardarEstado(estado) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  }

  let estado = cargarEstado();

  /* ----------------------------------------------------------
     1. CENTROS ASISTENCIALES (datos de ejemplo, Concepción/Biobío)
     ---------------------------------------------------------- */
  const CENTROS = [
    {
      id: "hgg",
      nombre: "Hospital Guillermo Grant Benavente",
      tipo: "hospital",
      distanciaKm: 3.2,
      esperaBaseMin: { rojo: 0, naranja: 8, amarillo: 45, verde: 110, azul: 140 },
      saturacion: 0.82,
    },
    {
      id: "sapu-omar",
      nombre: "SAPU Dr. Víctor Manuel Fernández",
      tipo: "sapu",
      distanciaKm: 1.8,
      esperaBaseMin: { rojo: 0, naranja: 12, amarillo: 35, verde: 70, azul: 90 },
      saturacion: 0.55,
    },
    {
      id: "clinica-biobio",
      nombre: "Clínica Bío Bío",
      tipo: "clinica",
      distanciaKm: 4.6,
      esperaBaseMin: { rojo: 0, naranja: 6, amarillo: 25, verde: 50, azul: 60 },
      saturacion: 0.4,
    },
    {
      id: "sapu-pedrodevaldivia",
      nombre: "SAPU Pedro de Valdivia",
      tipo: "sapu",
      distanciaKm: 2.5,
      esperaBaseMin: { rojo: 0, naranja: 10, amarillo: 40, verde: 85, azul: 100 },
      saturacion: 0.68,
    },
    {
      id: "hospital-traumatologico",
      nombre: "Hospital Traumatológico de Concepción",
      tipo: "hospital",
      distanciaKm: 5.1,
      esperaBaseMin: { rojo: 0, naranja: 9, amarillo: 38, verde: 95, azul: 120 },
      saturacion: 0.6,
    },
    {
      id: "clinica-sanagustin",
      nombre: "Clínica San Agustín",
      tipo: "clinica",
      distanciaKm: 6.0,
      esperaBaseMin: { rojo: 0, naranja: 7, amarillo: 22, verde: 45, azul: 55 },
      saturacion: 0.33,
    },
  ];

  const TAG_LABEL = { hospital: "Hospital", sapu: "SAPU", clinica: "Clínica privada" };

  /* ----------------------------------------------------------
     2. CATEGORÍAS DE TRIAGE (Manchester simplificado)
     ---------------------------------------------------------- */
  const CATEGORIAS = {
    rojo: {
      key: "rojo", nombre: "Resucitación", tiempoTexto: "Atención inmediata",
      desc: "Riesgo vital inmediato. Debes ser atendido sin espera. Si aún no estás en un centro de salud, considera llamar al 131 (SAMU).",
    },
    naranja: {
      key: "naranja", nombre: "Emergencia", tiempoTexto: "Hasta 10 minutos",
      desc: "Situación de alto riesgo que requiere evaluación médica muy pronto. Dirígete a un servicio de urgencia lo antes posible.",
    },
    amarillo: {
      key: "amarillo", nombre: "Urgencia", tiempoTexto: "Hasta 60 minutos",
      desc: "Tu cuadro requiere atención médica, pero puede esperar un tiempo acotado sin riesgo inmediato.",
    },
    verde: {
      key: "verde", nombre: "Urgencia menor", tiempoTexto: "Hasta 120 minutos",
      desc: "Tu situación no es de alto riesgo. Puedes esperar más tiempo, o evaluar atención en consultorio/box de menor complejidad.",
    },
    azul: {
      key: "azul", nombre: "No urgente", tiempoTexto: "Sin tiempo crítico",
      desc: "Tu cuadro no presenta señales de urgencia. Te recomendamos atención médica regular (consultorio, médico tratante) en lugar de un servicio de urgencia.",
    },
  };

  const ORDEN_CATS = ["rojo", "naranja", "amarillo", "verde", "azul"];

  /* ----------------------------------------------------------
     3. MOTOR DE CLASIFICACIÓN (simplificado, no es diagnóstico médico)
     ---------------------------------------------------------- */
  function clasificarTriage(datos) {
    const factores = [];
    let score = 0; // mayor score = mayor urgencia

    const signos = datos.signosAlarma || [];
    const SIGNOS_CRITICOS = ["perdida_conciencia", "dificultad_respirar", "sangrado_severo", "convulsion"];
    const SIGNOS_ALTOS = ["dolor_pecho", "confusion", "trauma_severo", "embarazo_riesgo"];

    signos.forEach((s) => {
      if (SIGNOS_CRITICOS.includes(s)) { score += 40; }
      else if (SIGNOS_ALTOS.includes(s)) { score += 28; }
    });
    if (signos.length) {
      factores.push(`${signos.length} signo(s) de alarma marcado(s)`);
    }

    // Dolor (0-10)
    const dolor = Number(datos.dolor || 0);
    if (dolor >= 8) { score += 25; factores.push("Dolor severo (8-10)"); }
    else if (dolor >= 5) { score += 12; factores.push("Dolor moderado (5-7)"); }
    else if (dolor >= 1) { score += 3; }

    // Signos vitales
    const fc = Number(datos.frecCardiaca);
    if (datos.frecCardiaca && (fc > 130 || fc < 40)) { score += 22; factores.push("Frecuencia cardíaca muy alterada"); }
    else if (datos.frecCardiaca && (fc > 110 || fc < 50)) { score += 10; factores.push("Frecuencia cardíaca alterada"); }

    const sat = Number(datos.saturacionO2);
    if (datos.saturacionO2 && sat < 90) { score += 35; factores.push("Saturación de O₂ crítica (<90%)"); }
    else if (datos.saturacionO2 && sat < 94) { score += 15; factores.push("Saturación de O₂ baja"); }

    const pas = Number(datos.presionSistolica);
    if (datos.presionSistolica && (pas < 90 || pas > 180)) { score += 18; factores.push("Presión arterial fuera de rango"); }

    const temp = Number(datos.temperatura);
    if (datos.temperatura && temp >= 39.5) { score += 12; factores.push("Fiebre alta (≥39.5°C)"); }

    // Inicio de síntomas: más reciente + score ya alto = más urgente
    if (datos.inicioSintomas === "menos1h" && score >= 20) { score += 8; factores.push("Inicio súbito (<1h)"); }

    // Edad de riesgo
    const edad = Number(datos.edad || 0);
    if (edad <= 1 || edad >= 75) { score += 8; factores.push(edad <= 1 ? "Lactante" : "Adulto mayor (≥75)"); }

    // Texto libre: heurística simple por palabras clave (no reemplaza juicio clínico)
    const texto = `${datos.sintomas || ""} ${datos.razonUrgencia || ""}`.toLowerCase();
    const PALABRAS_CRITICAS = ["no respira", "inconsciente", "no responde", "convulsion", "convulsión", "paro"];
    if (PALABRAS_CRITICAS.some((p) => texto.includes(p))) { score += 35; factores.push("Descripción sugiere riesgo vital"); }

    // --- Determinar categoría ---
    let cat;
    if (score >= 60) cat = "rojo";
    else if (score >= 38) cat = "naranja";
    else if (score >= 20) cat = "amarillo";
    else if (score >= 8) cat = "verde";
    else cat = "azul";

    if (!factores.length) factores.push("Sin signos de alarma relevantes reportados");

    return { categoria: cat, score, factores };
  }

  /* ----------------------------------------------------------
     4. NAVEGACIÓN ENTRE PANTALLAS
     ---------------------------------------------------------- */
  const screens = {
    1: document.getElementById("screen-triage"),
    2: document.getElementById("screen-centros"),
    3: document.getElementById("screen-cola"),
  };
  const stepButtons = document.querySelectorAll(".stepnav__item");

  function irAPaso(n) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("is-visible", Number(key) === n);
    });
    stepButtons.forEach((btn) => {
      btn.classList.toggle("is-active", Number(btn.dataset.step) === n);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function habilitarPaso(n) {
    const btn = document.querySelector(`.stepnav__item[data-step="${n}"]`);
    if (btn) btn.disabled = false;
  }

  stepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      irAPaso(Number(btn.dataset.step));
      if (Number(btn.dataset.step) === 2) renderCentros();
      if (Number(btn.dataset.step) === 3) actualizarCola(true);
    });
  });

  /* ----------------------------------------------------------
     5. FORMULARIO DE PRE-TRIAGE
     ---------------------------------------------------------- */
  const form = document.getElementById("form-triage");
  const dolorInput = document.getElementById("f-dolor");
  const dolorOut = document.getElementById("f-dolor-out");

  dolorInput.addEventListener("input", () => { dolorOut.textContent = dolorInput.value; });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const datos = {
      nombre: fd.get("nombre")?.trim(),
      rut: fd.get("rut")?.trim(),
      edad: fd.get("edad"),
      sexo: fd.get("sexo"),
      peso: fd.get("peso"),
      estatura: fd.get("estatura"),
      telefono: fd.get("telefono"),
      contactoEmergencia: fd.get("contactoEmergencia"),
      sintomas: fd.get("sintomas")?.trim(),
      razonUrgencia: fd.get("razonUrgencia")?.trim(),
      signosAlarma: fd.getAll("signoAlarma"),
      dolor: fd.get("dolor"),
      inicioSintomas: fd.get("inicioSintomas"),
      frecCardiaca: fd.get("frecCardiaca"),
      presionSistolica: fd.get("presionSistolica"),
      saturacionO2: fd.get("saturacionO2"),
      temperatura: fd.get("temperatura"),
      alergias: fd.get("alergias")?.trim(),
      antecedentes: fd.get("antecedentes")?.trim(),
    };

    if (!datos.nombre || !datos.rut || !datos.edad || !datos.sexo || !datos.peso || !datos.estatura || !datos.telefono || !datos.sintomas) {
      alert("Por favor completa los campos obligatorios marcados en el formulario (identificación y síntomas).");
      return;
    }

    const resultado = clasificarTriage(datos);

    estado.paciente = datos;
    estado.triage = resultado;
    estado.centroId = null;
    estado.cola = null;
    guardarEstado(estado);

    mostrarResultadoTriage(resultado);
    habilitarPaso(2);
  });

  function mostrarResultadoTriage(resultado) {
    const panel = document.getElementById("triage-result");
    const cat = CATEGORIAS[resultado.categoria];

    panel.hidden = false;
    panel.className = `result-panel cat-${resultado.categoria}`;
    document.getElementById("result-cat").textContent = cat.nombre.toUpperCase();
    document.getElementById("result-time").textContent = cat.tiempoTexto;
    document.getElementById("result-title").textContent = `Categoría: ${cat.nombre}`;
    document.getElementById("result-desc").textContent = cat.desc;

    const factoresEl = document.getElementById("result-factors");
    factoresEl.innerHTML = "";
    resultado.factores.forEach((f) => {
      const li = document.createElement("li");
      li.textContent = f;
      factoresEl.appendChild(li);
    });

    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  document.getElementById("btn-go-centros").addEventListener("click", () => {
    irAPaso(2);
    renderCentros();
  });

  // Si ya había un resultado guardado (recarga de página), lo mostramos
  if (estado.triage) {
    mostrarResultadoTriage(estado.triage);
    habilitarPaso(2);
    if (estado.cola) habilitarPaso(3);
  }

  /* ----------------------------------------------------------
     6. PANTALLA 2 — CENTROS ASISTENCIALES
     ---------------------------------------------------------- */
  const sortSelect = document.getElementById("sort-centros");
  const filterTipo = document.getElementById("filter-tipo");
  const centrosListEl = document.getElementById("centros-list");
  const chipPrioridad = document.getElementById("centros-prioridad-chip");

  function esperaParaCentro(centro, categoria) {
    const base = centro.esperaBaseMin[categoria] ?? 60;
    // saturación amplifica la espera (excepto categorías críticas, que casi no esperan)
    const factorSaturacion = categoria === "rojo" ? 1 : 1 + centro.saturacion * 0.8;
    return Math.round(base * factorSaturacion);
  }

  function renderCentros() {
    const categoria = estado.triage ? estado.triage.categoria : "amarillo";
    chipPrioridad.textContent = CATEGORIAS[categoria].nombre;
    chipPrioridad.className = `chip chip--inline cat-${categoria}`;

    let lista = CENTROS.map((c) => ({
      ...c,
      esperaMin: esperaParaCentro(c, categoria),
    }));

    const tipo = filterTipo.value;
    if (tipo !== "todos") lista = lista.filter((c) => c.tipo === tipo);

    const orden = sortSelect.value;
    if (orden === "espera") lista.sort((a, b) => a.esperaMin - b.esperaMin);
    else if (orden === "distancia") lista.sort((a, b) => a.distanciaKm - b.distanciaKm);
    else {
      // "recomendado": balance entre espera y distancia (espera pesa más para categorías urgentes)
      const pesoEspera = categoria === "rojo" || categoria === "naranja" ? 0.85 : 0.6;
      lista.sort((a, b) => {
        const scoreA = a.esperaMin * pesoEspera + a.distanciaKm * (1 - pesoEspera) * 15;
        const scoreB = b.esperaMin * pesoEspera + b.distanciaKm * (1 - pesoEspera) * 15;
        return scoreA - scoreB;
      });
    }

    centrosListEl.innerHTML = "";
    lista.forEach((centro, idx) => {
      const card = document.createElement("article");
      card.className = "centro-card";
      if (estado.centroId === centro.id) card.classList.add("is-selected");

      const esperaClass = centro.esperaMin <= 15 ? "is-good" : centro.esperaMin <= 50 ? "is-warn" : "is-bad";

      card.innerHTML = `
        <span class="centro-card__rank">${String(idx + 1).padStart(2, "0")}</span>
        <div class="centro-card__main">
          <span class="centro-card__name">${centro.nombre}</span>
          <div class="centro-card__tags">
            <span class="tag tag--${centro.tipo}">${TAG_LABEL[centro.tipo]}</span>
          </div>
        </div>
        <div class="centro-card__stat">
          <span class="centro-card__stat-label">Distancia</span>
          <span class="centro-card__stat-value">${centro.distanciaKm.toFixed(1)} km</span>
        </div>
        <div class="centro-card__stat">
          <span class="centro-card__stat-label">Espera estimada</span>
          <span class="centro-card__stat-value ${esperaClass}">${centro.esperaMin} min</span>
        </div>
        <div class="centro-card__cta">
          <button type="button" class="btn ${estado.centroId === centro.id ? "btn--ghost" : "btn--primary"}" data-centro="${centro.id}">
            ${estado.centroId === centro.id ? "Centro elegido ✓" : "Elegir este centro"}
          </button>
        </div>
      `;
      centrosListEl.appendChild(card);
    });

    centrosListEl.querySelectorAll("[data-centro]").forEach((btn) => {
      btn.addEventListener("click", () => seleccionarCentro(btn.dataset.centro));
    });
  }

  function seleccionarCentro(centroId) {
    const centro = CENTROS.find((c) => c.id === centroId);
    if (!centro) return;

    const categoria = estado.triage ? estado.triage.categoria : "amarillo";
    const esperaMin = esperaParaCentro(centro, categoria);

    // Generar una posición de cola simulada y razonable según categoría
    const personasAntesBase = {
      rojo: 0, naranja: Math.floor(Math.random() * 2), amarillo: 3 + Math.floor(Math.random() * 5),
      verde: 6 + Math.floor(Math.random() * 8), azul: 9 + Math.floor(Math.random() * 10),
    };
    const personasAntes = personasAntesBase[categoria] ?? 5;

    estado.centroId = centroId;
    estado.cola = {
      centroNombre: centro.nombre,
      categoria,
      personasAntesInicial: personasAntes,
      personasAntes,
      tiempoRestanteInicialMin: esperaMin,
      tiempoRestanteMin: esperaMin,
      numeroOrden: 100 + Math.floor(Math.random() * 800),
      horaInicio: Date.now(),
      eventos: [
        { texto: "Pre-triage completado", estado: "done" },
        { texto: `Te inscribiste en ${centro.nombre}`, estado: "done" },
        { texto: "Esperando llamado a box de atención", estado: "current" },
        { texto: "Atención médica", estado: "pending" },
      ],
    };
    guardarEstado(estado);

    renderCentros();
    habilitarPaso(3);
    irAPaso(3);
    actualizarCola(true);
    iniciarTickerCola();
  }

  sortSelect.addEventListener("change", renderCentros);
  filterTipo.addEventListener("change", renderCentros);

  /* ----------------------------------------------------------
     7. PANTALLA 3 — COLA EN VIVO
     ---------------------------------------------------------- */
  const RING_CIRC = 2 * Math.PI * 86; // ≈ 540, debe calzar con stroke-dasharray en CSS

  let tickerId = null;

  function actualizarCola(forzarRender) {
    if (!estado.cola) return;

    const cola = estado.cola;
    const minutosTranscurridos = (Date.now() - cola.horaInicio) / 60000;

    // El tiempo restante baja con el tiempo real transcurrido (simulado)
    const tiempoRestante = Math.max(0, Math.round(cola.tiempoRestanteInicialMin - minutosTranscurridos));
    // Las personas antes bajan proporcionalmente al tiempo restante
    const proporcion = cola.tiempoRestanteInicialMin > 0
      ? tiempoRestante / cola.tiempoRestanteInicialMin
      : 0;
    const personasAntes = Math.round(cola.personasAntesInicial * proporcion);

    cola.tiempoRestanteMin = tiempoRestante;
    cola.personasAntes = personasAntes;

    if (personasAntes <= 0 && cola.eventos[2].estado === "current") {
      cola.eventos[2].estado = "done";
      cola.eventos[3].estado = "current";
    }

    guardarEstado(estado);

    // --- Render ---
    document.getElementById("cola-personas-antes").textContent = personasAntes;
    document.getElementById("cola-tiempo-restante").textContent =
      tiempoRestante <= 0 ? "Eres el próximo" : `${tiempoRestante} min`;
    document.getElementById("cola-categoria").textContent = CATEGORIAS[cola.categoria].nombre;
    document.getElementById("cola-centro").textContent = cola.centroNombre;
    document.getElementById("cola-numero").textContent = `#${cola.numeroOrden}`;

    const ring = document.getElementById("ring-fg");
    const avance = cola.personasAntesInicial > 0 ? 1 - personasAntes / cola.personasAntesInicial : 1;
    const offset = RING_CIRC - avance * RING_CIRC;
    ring.style.strokeDashoffset = String(Math.max(0, offset));

    const coloresPorCat = { rojo: "var(--rojo)", naranja: "var(--naranja)", amarillo: "var(--amarillo)", verde: "var(--verde)", azul: "var(--azul)" };
    ring.style.stroke = coloresPorCat[cola.categoria] || "var(--teal-600)";

    if (forzarRender) renderTimeline();
  }

  function renderTimeline() {
    const cola = estado.cola;
    if (!cola) return;
    const ul = document.getElementById("timeline-list");
    ul.innerHTML = "";
    const horaBase = new Date(cola.horaInicio);

    cola.eventos.forEach((ev, idx) => {
      const li = document.createElement("li");
      li.className = ev.estado === "done" ? "is-done" : ev.estado === "current" ? "is-current" : "";
      const hora = new Date(horaBase.getTime() + idx * 60000 * 2);
      li.innerHTML = `<strong>${ev.texto}</strong><time>${hora.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</time>`;
      ul.appendChild(li);
    });
  }

  function iniciarTickerCola() {
    if (tickerId) clearInterval(tickerId);
    tickerId = setInterval(() => actualizarCola(true), 5000);
  }

  document.getElementById("btn-salir-fila").addEventListener("click", () => {
    if (!confirm("¿Seguro que quieres salir de la fila? Perderás tu posición actual.")) return;
    estado.cola = null;
    estado.centroId = null;
    guardarEstado(estado);
    if (tickerId) clearInterval(tickerId);
    document.querySelector('.stepnav__item[data-step="3"]').disabled = true;
    irAPaso(2);
    renderCentros();
  });

  // Si ya hay una cola guardada (recarga de página), restauramos y
  // llevamos directo a esa pantalla, ya que el usuario sigue esperando.
  if (estado.cola) {
    actualizarCola(true);
    iniciarTickerCola();
    irAPaso(3);
  }

  /* ----------------------------------------------------------
     8. INICIALIZACIÓN
     ---------------------------------------------------------- */
  renderCentros();
})();
